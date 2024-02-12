const MongoDB = require('./sources/mongodb');


(async () => {
  const mongo1 = new MongoDB(100000, { mode: 'paginated', pageSize: 100000 });
  const mongo2 = new MongoDB(100000, { mode: 'cursor' });
  const mongo3 = new MongoDB(100000, { mode: 'hasNextNext' });

  for (const iter of [mongo1, mongo2, mongo3]) {
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

  const mongostream1 = new MongoDB(10000, { mode: 'NativeMongoStream' });
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