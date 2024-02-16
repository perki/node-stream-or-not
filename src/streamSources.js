/**
 * Simply consume all sources
 */

const MongoDB = require('./sources/mongodb');
const generator = require('./sources/generator');
const InMemoryArray = require('./sources/inmemoryArray');
const { Readable } = require('stream');
const { TransformStream } = require('./transformer');

(async () => {
  const size = 100000;
  const mongo1 = new MongoDB(size, { mode: 'paginated', pageSize: size });
  const mongo2 = new MongoDB(size, { mode: 'cursor' });
  const mongo3 = new MongoDB(size, { mode: 'hasNextNext' });
  const gen1 = generator(size);
  const inMemoryArray = new InMemoryArray(size);
  const mongostream1 = new MongoDB(size, { mode: 'NativeMongoStream' });
  
  const streams = [];

  for (const iter of [mongo1, mongo2, mongo3, gen1, inMemoryArray]) {
    console.log(iter + '');
    streams.push({
      info: iter.toString(),
      getStream: async function () { await iter.ready(); return Readable.from(iter); },
      close: async function() { await iter.close(); }
    });
    
  }

  streams.push({
    info: mongostream1.toString(),
    getStream: async function() { await mongostream1.ready(); return  mongostream1.stream },
    close: async function() { await mongostream1.close(); }
  });


  for (const s of streams) {
    console.time('total');
    console.time('prepare');
    const stream = await s.getStream();
    console.timeEnd('prepare');
    console.time('stream');
    const t = new TransformStream();
    await consumeStream(stream.pipe(t), () => {});
    console.timeEnd('stream');
    console.timeEnd('total');
    console.log(s.info + '\n');
    await s.close();
  }

})();


function consumeStream(stream, callbackOnEach) {
  return new Promise((resolve, reject) => {
    stream.on('data', callbackOnEach)
        .on('end', resolve)
        .on('error', reject);
  });
}