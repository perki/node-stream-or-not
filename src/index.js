const MongoDB = require('./sources/mongodb');
const generator = require('./sources/generator');
const InMemoryArray = require('./sources/inmemoryArray');

(async () => {
  const size = 100000;
  const mongo1 = new MongoDB(size, { mode: 'paginated', pageSize: size });
  const mongo2 = new MongoDB(size, { mode: 'cursor' });
  const mongo3 = new MongoDB(size, { mode: 'hasNextNext' });
  const gen1 = generator(size);
  const inMemoryArray = new InMemoryArray(size);

  for (const iter of [mongo1, mongo2, mongo3, gen1, inMemoryArray]) {
    console.time('total');
    console.time('load');
    await iter.ready();
    console.timeEnd('load');
    console.time('done');
    let z = 0;
    for await (const value of iter) {
      //console.log(value);
      z++;
    }
    console.timeEnd('done');
    console.timeEnd('total');
    console.log(iter + ' count=' + z + '\n');
    
    await iter.close();
  }

  const mongostream1 = new MongoDB(size, { mode: 'NativeMongoStream' });
  await mongostream1.ready();
  console.time('done');
  let z = 0;
  await consumeStream(mongostream1.stream, data => { z++; });
  console.log(mongostream1 + ' count=' + z);
  console.timeEnd('done');
  await mongostream1.close();

})();


function consumeStream(stream, callbackOnEach) {
  return new Promise((resolve, reject) => {
    stream.on('data', callbackOnEach)
        .on('end', resolve)
        .on('error', reject);
  });
}