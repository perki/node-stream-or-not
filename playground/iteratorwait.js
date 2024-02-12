
const myIteratorWithEmptyStuff = {}
myIteratorWithEmptyStuff[Symbol.asyncIterator] = getIterator;

class Bob {
  constructor() { }

  async ready() {
    this[Symbol.asyncIterator] = getIterator;
  }
}


function getIterator () {
  let i = 0;
  return {
    async next () {
      const done = i >= 10;
      i++;
      await new Promise(resolve => setTimeout(resolve, 20));
      return { value: i, done }
    }
  }
};

(async () => {
  const bob = new Bob();
  await bob.ready();
  for await (const value of bob) {
    console.log(value);
  }
  //for await (const value of myIteratorWithEmptyStuff) { console.log(value); }
})();