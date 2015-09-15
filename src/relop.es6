// Options: --free-variable-checker --require --validate
/*global module require*/

module.exports = (function(){
  "use strict";

  const {def, confine} = require('./sesshim.es6');
  const {indent} = require('./indent.es6');

  let i = 1;
  function newVar(prefix) { return `${prefix}_${i++}`; }

  const Plus = def({
    IIO(x, y) {
      return def({
        *[Symbol.iterator]() {
          yield [x+y];
        }
      });
    },
    IIOMac([x, y], inner, [z]) {
      return indent`
let ${z} = ${x} + ${y};
${inner}`;
    }
  });

  const Range = def({
    IIOMac([start, bound], inner, [i]) {
      return indent`
for (let ${i} = ${start}; ${i} < ${bound}; ${i}++) {
  ${inner}
}`;
    },
    IIIMac([start, bound, i], inner, []) {
      return indent`
if (${start} <= ${i} && ${i} < ${bound}) {
  ${inner}
}`;
    }
  });

  const Index = def({
    IOOMac([list], inner, [i, v]) {
      const len = newVar('len');
      return indent`
for (let ${i} = 0, ${len} = ${list}.length; ${i} < ${len}; ${i}++) {
  let ${v} = ${list}[${i}];
  ${inner}
}`;
    }
  });

  return def({Plus, Range, Index});
}());
