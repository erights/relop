// Options: --free-variable-checker --require --validate
/*global module require*/

module.exports = (function(){
  "use strict";

  const {def} = require('../src/sesshim.es6');
  const {compile, modes, Plus, Range, Index, Equal} = require('../src/relop.es6');

  console.log(
    Plus(`2`, `3`, `z`).IIO(
      Range(`0`, `z`, `i`).IIO(
        Index(`array`, `i`, `o`).IIO(
          `yield [i,o];`))));

  const clause = compile(`F`, [`array`, `i`, `o`],
                         [Plus(`2`, `3`, `z`),
                          Range(`0`, `z`, `i`),
                          Index(`array`, `i`, `o`)]);

  console.log(''+clause);

  for (let clMode of modes(clause)) {
    console.log(`${clMode}: ${clause[clMode]}`);
  }

  return def({});
}());
