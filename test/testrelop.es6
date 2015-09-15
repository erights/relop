
// Options: --free-variable-checker --require --validate
/*global module require*/

module.exports = (function(){
  "use strict";

  const {def} = require('../src/sesshim.es6');
  const {Plus, Range, Index} = require('../src/relop.es6');

  console.log(Plus.IIOMac([`2`, `3`], 
              Range.IIOMac([`0`, `z`], 
                           Index.IOOMac([`list`],
                                        ``,
                                        [`i`, `o`]),
                           [`i`]),
              [`z`]));

  return def({});
}());
