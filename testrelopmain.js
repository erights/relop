/*global module require*/

/**
 * Note that this test is a .js file written in ES5.
 */
module.exports = (function(){
  "use strict";

  var sesshim = require('./src/sesshim.js');
  var def = sesshim.def;
  require('./test/testrelop.js');

  return def({});
}());
