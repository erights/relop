// Options: --free-variable-checker --require --validate
/*global module require*/

module.exports = (function(){
  "use strict";

  const {def, confine} = require('./sesshim.es6');
  const {indent} = require('./indent.es6');

  let i = 1;
  function newVar(prefix) { return `${prefix}_${i++}`; }

  function CHECK(flag, error) {
    if (!flag) {
      throw new Error(error);
    }
  }


  function ConstSet(iterable) {
    const set = new Set(iterable);
    return def({
      toString() { return `ConstSet { ${[...set].join(', ')} }`; },
      has(m) { return set.has(m); },
      size() { return set.size(); },
      [Symbol.iterator]() { return set[Symbol.iterator](); },

      with(...members) {
        return ConstSet([...set, ...members]);
      }
    });
  }
  ConstSet.Empty = new ConstSet([]);


  const MODE_RE = def(/^[IO]*$/);
  function* modes(op) {
    for (let verb in op) {
      if (MODE_RE.test(verb)) {
        yield verb;
      }
    }
  }

  const IDENT_RE = def(/[a-zA-Z_$][\w$]*/);
  const isIdent = IDENT_RE.test.bind(IDENT_RE);

  function modeSplit(paramNames, mode) {
    const inParams = [];
    const outParams = [];
    const arity = mode.length;
    CHECK(arity === paramNames.length, `arity mismatch`);
    for (let i = 0; i < arity; i++) {
      (mode[i] === 'I' ? inParams : outParams).push(paramNames[i]);
    }
    return [inParams, outParams];
  }

  function possibleMode(varNames, inArgs) {
    for (let inArg of inArgs) {
      if (isIdent(inArg) && !varNames.has(inArg)) {
        return false;
      }
    }
    return true;
  }

  function compile(name, paramNames, ops) {
    const opModes = [];
    opModes.length = ops.length;
    const clause = {
      toString() {
        return indent`
rule ${name}(${paramNames.join(', ')}) :- {
  ${ops.join(`;
`)};
}`;
      }
    };
    searchOp(ConstSet(paramNames), ConstSet.Empty, 0);
    return def(clause);

    function searchOp(varNames, inNames, opIndex) {
      if (opIndex < ops.length) {
        const op = ops[opIndex];
        for (let opMode of modes(op)) {
          const [inArgs, outArgs] = modeSplit(op.argExprs, opMode);
          if (possibleMode(varNames, inArgs)) {
            opModes[opIndex] = opMode;
            const argNames = op.argExprs.filter(isIdent);
            searchOp(varNames.with(...argNames),
                     inNames.with(...inArgs.filter(isIdent)),
                     opIndex + 1);
            opModes[opIndex] = void 0;
          }
        }
      } else {
        const clauseMode =
            paramNames.map(n => inNames.has(n) ? 'I' : 'O').join('');
        const [inParams, outParams] = modeSplit(paramNames, clauseMode);
        let body = indent`
yield [${outParams.join(',')}];`;
        for (let i = ops.length -1; i >= 0; i--) {
          body = ops[i][opModes[i]](body);
        }
        const src = indent`
// ${opModes.join(', ')}
(function ${name}_${clauseMode}(${inParams.join(', ')}) {
  return def({
    *[Symbol.iterator]() {
      ${body}
    }
  });
})`;
        if (clauseMode in clause) {
console.log(indent`
worse ${clauseMode}: ${src}`);
          return;
        }
        clause[clauseMode] = src;
      }
    }
  }

  function Plus(x, y, z) {
    return def({
      toString() { return `Plus(${x},${y},${z})`; },
      argExprs: [...arguments],
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
      toString() { return `Range(${start},${bound},${i})`; },
      argExprs: [...arguments],
      III(inner) { return indent`
if (${start} <= ${i} && ${i} < ${bound}) {
  ${inner}
}`;
      },
      IIO(inner) { return indent`
for (let ${i} = ${start}; ${i} < ${bound}; ${i}++) {
  ${inner}
}`;
      }
    });
  }

  function Index(array, i, v) {
    return def({
      toString() { return `Index(${array},${i},${v})`; },
      argExprs: [...arguments],
      IIO(inner) { return indent`
if (0 <= ${i} && ${i} < ${array}.length) {
  const ${v} = ${array}[${i}];
  ${inner}
`;
      },
      IOO(inner) {
        const len = newVar('len');
        return indent`
for (let ${i} = 0, ${len} = ${array}.length; ${i} < ${len}; ${i}++) {
  const ${v} = ${array}[${i}];
  ${inner}
}`;
      }
    });
  }

  function Equal(x, y) {
    return def({
      toString() { return `Equal(${x},${y})`; },
      argExprs: [...arguments],
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

  return def({compile, modes, Plus, Range, Index, Equal});
}());
