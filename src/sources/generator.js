
function* generator(size) {
  let index = 0;
  while (index < size) {
    yield {
      i: index,
      s: '' + index
    }
    index++;
  }
}
generator.prototype.toString = function() { return 'Generator'};
generator.prototype.ready = async function() { };
generator.prototype.close = async function() { };




module.exports = generator;