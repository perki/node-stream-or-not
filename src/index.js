const MongoDB = require('./sources/mongodb');
const generator = require('./sources/generator');

(async () => {
  const size = 100000;
  const mongo1 = new MongoDB(size, { mode: 'paginated', pageSize: size });
  const mongo2 = new MongoDB(size, { mode: 'cursor' });
  const mongo3 = new MongoDB(size, { mode: 'hasNextNext' });
  const gen1 = generator(size);

  for (const iter of [mongo1, mongo2, mongo3, gen1]) {
    await iter.ready();
    console.time('done');
    let z = 0;
    for await (const value of iter) {
      //console.log(value);
      z++;
    }
    console.log(iter + ' count=' + z);
    console.timeEnd('done');
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