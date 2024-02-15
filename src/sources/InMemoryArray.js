
class InMemoryArray {
  size;
  content;
  constructor(size) {
    this.size = size;
    this.content = [];
  }

  toString() {
    return `BigArray: size=${this.size}`;
  }

  async ready() {
    for (let i = 0; i < this.size; i++) {
      this.content.push({
        i: i,
        s: '' + i
      });
    }
    
   
    this[Symbol.asyncIterator] = function () {
      let index = 0;
      const content = this.content;
      return {
        async next() {
          if (index >= content.length) return { done: true };
          index++;
          return { value: content[index-1], done: false };
        }
      }
    }.bind(this);
  }


  async close() { }
}


module.exports = InMemoryArray;
