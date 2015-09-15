// Options: --free-variable-checker --require --validate
/*global module require*/

module.exports = (function(){
  "use strict";

  const {def} = require('../src/sesshim.es6');
  const {Plus, Range, Index, Equal} = require('../src/relop.es6');

  console.log(
    Plus(`2`, `3`, `z`).IIO(
      Range(`0`, `z`, `i`).IIO(
        Index(`list`, `i`, `o`).IIO(
          `yield [i,o];`))));

  return def({});
}());
