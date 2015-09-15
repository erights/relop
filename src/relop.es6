// Options: --free-variable-checker --require --validate
/*global module require*/

module.exports = (function(){
  "use strict";

  const {def, confine} = require('./sesshim.es6');
  const {indent} = require('./indent.es6');

  let i = 1;
  function newVar(prefix) { return `${prefix}_${i++}`; }

  function Plus(x, y, z) {
    return def({
      toString() { return `Plus(${x}, ${y}, ${z})`; },
      IIO(inner) { return indent`
const ${z} = ${x} + ${y};
${inner}`;
      },
      IOI(inner) { return indent`
const ${y} = ${z} - ${x};
${inner}`;
      },
      OII(inner) { return indent`
const ${x} = ${z} - ${y};
${inner}`;
      }
    });
  }

  function Range(start, bound, i) {
    return def({
      toString() { return `Range(${start}, ${bound}, ${i})`; },
      IIO(inner) { return indent`
for (let ${i} = ${start}; ${i} < ${bound}; ${i}++) {
  ${inner}
}`;
      },
      III(inner) { return indent`
if (${start} <= ${i} && ${i} < ${bound}) {
  ${inner}
}`;
      }
    });
  }

  function Index(list, i, v) {
    return def({
      toString() { return `Index(${list}, ${i}, ${v})`; },
      IIO(inner) { return indent`
if (0 <= ${i} && ${i} < ${list}.length) {
  const ${v} = ${list}[${i}];
  ${inner}
`;
      },
      IOO(inner) {
        const len = newVar('len');
        return indent`
for (let ${i} = 0, ${len} = ${list}.length; ${i} < ${len}; ${i}++) {
  const ${v} = ${list}[${i}];
  ${inner}
}`;
      }
    });
  }

  function Equal(x, y) {
    return def({
      toString() { return `Equal(${x}, ${y})`; },
      II(inner) { return indent`
if (equal(${x}, ${y})) {
  ${inner}
}`;
      },
      IO(inner) {
        return indent`
const ${y} = ${x};
${inner}`;
      },
      OI(inner) {
        return indent`
const ${x} = ${y};
${inner}`;
      }
    });
  }

  return def({Plus, Range, Index, Equal});
}());
