
const Transform = require('stream').Transform;

let i = 0;

function transform(item) {
  item.t = i++;
  return item;
}

class TransformStream extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  _transform (item, encoding, callback) {
    transform(item);
    this.push(item);
    callback();
  }
}

module.exports = {
  TransformStream,
  transform
}

