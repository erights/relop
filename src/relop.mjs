// @ts-check

// @ts-ignore
import { harden } from './sesshim.mjs';
// @ts-ignore
import { indent } from './indent.mjs';

let i = 1;
const newVar = prefix => `${prefix}_${i++}`;

const CHECK = (flag, error) => {
  if (!flag) {
    throw new Error(error);
  }
};

const ConstSet = iterable => {
  const set = new Set(iterable);
  const label = `{{${[...set].join(',')}}}`;
  return harden({
    label,
    toString: () => label,
    has: m => set.has(m),
    get size() {
      return set.size;
    },
    [Symbol.iterator]: () => set[Symbol.iterator](),
    with: (...members) => ConstSet([...set, ...members]),
  });
}
ConstSet.Empty = ConstSet([]);

const MODE_RE = /^[IO]*$/;
export function* modes(op) {
  for (const verb of Object.getOwnPropertyNames(op)) {
    if (MODE_RE.test(verb)) {
      yield verb;
    }
  }
}

const IDENT_RE = /[a-zA-Z_$][\w$]*/;
const isIdent = str => IDENT_RE.test(str);

const modeSplit = (paramNames, mode) => {
  const inParams = [];
  const outParams = [];
  const arity = mode.length;
  CHECK(arity === paramNames.length, `arity mismatch`);
  for (let i = 0; i < arity; i++) {
    (mode[i] === 'I' ? inParams : outParams).push(paramNames[i]);
  }
  return [inParams, outParams];
};

const possibleMode = (varNames, inArgs, defNames, outArgs) => {
  for (let inArg of inArgs) {
    if (isIdent(inArg) && !varNames.has(inArg)) {
      return false;
    }
  }
  for (let outArg of outArgs) {
    if (defNames.has(outArg)) {
      return false;
    }
  }
  return true;
};

export const compile = (name, paramNames, ops) => {
  const opModes = [];
  opModes.length = ops.length;
  const clause = {
    toString: () => indent`
rule ${name}(${paramNames.join(', ')}) :- {
  ${ops.join(`;
`)};
}`
  };
  const searchOp = (varNames, inNames, defNames, opIndex) => {
    if (opIndex < ops.length) {
      const op = ops[opIndex];
      for (let opMode of modes(op)) {
        const [inArgs, outArgs] = modeSplit(op.argExprs, opMode);
        if (possibleMode(varNames, inArgs, defNames, outArgs)) {
          opModes[opIndex] = opMode;
          const argNames = op.argExprs.filter(isIdent);
          const newInNames =
            inArgs.filter(isIdent).filter(n => !defNames.has(n));
          searchOp(varNames.with(...argNames),
            inNames.with(...newInNames),
            defNames.with(...argNames),
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
      for (let i = ops.length - 1; i >= 0; i--) {
        body = ops[i][opModes[i]](body);
      }
      const src = indent`
(function ${name}_${clauseMode}(${inParams.join(', ')}) {
  // ${opModes.join(', ')}
  return harden({
    *[Symbol.iterator]() {
      ${body}
    }
  });
})`;
      if (clauseMode in clause) {
        return;
      }
      const func = (1,eval)(src);
      func.toString = () => src;
      clause[clauseMode] = func;

    }
  };
  searchOp(ConstSet(paramNames), ConstSet.Empty, ConstSet.Empty, 0);
  return harden(clause);
};

export const Plus = (x, y, z) => {
  return harden({
    toString() { return `Plus(${x},${y},${z})`; },
    argExprs: [x, y, z],
    IIO(inner) {
      return indent`
const ${z} = ${x} + ${y};
${inner}`;
    },
    IOI(inner) {
      return indent`
const ${y} = ${z} - ${x};
${inner}`;
    },
    OII(inner) {
      return indent`
const ${x} = ${z} - ${y};
${inner}`;
    }
  });
};

export const Range = (start, bound, i) => {
  return harden({
    toString() { return `Range(${start},${bound},${i})`; },
    argExprs: [start, bound, i],
    III(inner) {
      return indent`
if (${start} <= ${i} && ${i} < ${bound}) {
  ${inner}
}`;
    },
    IIO(inner) {
      return indent`
for (let ${i} = ${start}; ${i} < ${bound}; ${i}++) {
  ${inner}
}`;
    }
  });
};

export const Index = (array, i, v) => {
  return harden({
    toString() { return `Index(${array},${i},${v})`; },
    argExprs: [array, i, v],
    IIO(inner) {
      return indent`
if (0 <= ${i} && ${i} < ${array}.length) {
  const ${v} = ${array}[${i}];
  ${inner}
}`;
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
};

export const Equal = (x, y) => {
  return harden({
    toString() { return `Equal(${x},${y})`; },
    argExprs: [x, y],
    II(inner) {
      return indent`
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
};
