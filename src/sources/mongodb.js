
const { MongoClient } = require('mongodb');


class MongoDB {
  client;
  size;
  options;
  cursor;
  constructor(size, options) {
    this.size = size;
    this.options = options || {};
    this.options.mode = this.options.mode || 'cursor'; // supports paginated
    if (this.options.mode !== 'paginated') {
      this.options.pageSize = 'n/a';
    } else {
      this.options.pageSize = this.options.pageSize || 1000;
    }
  }

  toString() {
    return `MongoDB ${this.options.mode}: size=${this.size} pageSize=${this.options.pageSize}`;
  }

  async ready() {
    this.client = new MongoClient(this.options.MongoURI || 'mongodb://localhost:27017/?retryWrites=true&w=majority');
    await this.client.connect();
    const db = this.client.db('bench');
    const collection = db.collection('docs');
    // check if there are enough documents
    await checkAndFillCollection(this.size, collection);

    if (this.options.mode === 'hasNextNext') {
      this.cursor = collection.find({}).limit(this.size);
      // assign iterator to cursor using hasNext next
      this[Symbol.asyncIterator] = await getIteratorFromHasNextNext(this.cursor);
      return this;
    }

    if (this.options.mode === 'cursor') {
      this.cursor = collection.find({}).limit(this.size);
      // assign iterator to cursor
      this[Symbol.asyncIterator] = this.cursor[Symbol.asyncIterator].bind(this.cursor);
      return this;
    }

    if (this.options.mode === 'NativeMongoStream') {
      this.cursor = collection.find({}).limit(this.size);
      // assign stream to cursor
      this.stream = this.cursor.stream();
      return this;
    }

    if (this.options.mode === 'paginated') {
      // here we are in paginated mode
      // partinally async method fetching by array 
      this[Symbol.asyncIterator] = await getPaginatedIterator(this.size, this.options.pageSize, collection);
      return this;
    }

    throw new Error('Unkown mode ' + this.options.mode);
  }


  async close() {
    if (this.cursor) { await this.cursor.close(); }
    await this.client.close();
  }
}


module.exports = MongoDB;

/**
 * Get an Async iterator for cursor
 */
function getIteratorFromHasNextNext(cursor) {
  return function () {
    return {
      async next() {
        if (! await cursor.hasNext()) return { done: true };
        return { value: await cursor.next(), done: false };
      }
    }
  }
}

/**
 * Get a paginated array fetching iterator
 */
async function getPaginatedIterator(size, pageSize, collection) {
  let skip = 0;
  let items = [];
  let i = 0;
  await nextPage();

  async function nextPage() {
    const count = (pageSize + skip > size) ? size - skip : pageSize;
    if (count <= 0) {
      items = [];
    } else {
      items = await collection.find({}).limit(count).skip(skip).toArray();
    }
    skip += count;
    i = 0;
  }

  return function () {
    return {
      async next() {
        if (i >= items.length) { // items exhausted
          if (items.length < pageSize) { // it is the last page
            return { done: true }
          }
          // get next page
          await nextPage();
          if (items.length === 0) return { done: true }; // nothing new
        }
        return { value: items[i++], done: false };
      }
    }
  }
}


/**
 * Fill the collection by batch of 1000 up to the requestedSute
 * @param {int} size - size to reach
 * @param {*} collection 
 */
async function checkAndFillCollection(size, collection) {
  const batchSize = 1000;
  const count = await collection.count();
  for (let i = count; i < size; i += batchSize) {
    const batchItems = [];
    for (let n = 0; n < batchSize; n++) {
      const content = Math.random() * 100000;
      batchItems.push({
        i: content,
        s: '' + content
      });
    }
    await collection.insertMany(batchItems);
    console.log('filling collectin ' + i);
  }
}