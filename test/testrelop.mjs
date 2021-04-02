// @ts-check

import {
  compileClause, Plus, Range, Index,
  makeClauseFromOpMaker, makeOpMakerFromClause
// @ts-ignore
} from '../src/relop.mjs';

console.log(
  Plus(`x`, `y`, `z`).IIO(`yield [z];`), '\n');

const clauseSrc1 = compileClause(`P`, [`x`, `y`, `z`], [Plus(`x`, `y`, `z`)]);

console.log(clauseSrc1);

console.log('-------');

console.log(
  Plus(`2`, `3`, `z`).IIO(
    Range(`0`, `z`, `i`).IIO(
      Index(`array`, `i`, `o`).IIO(
        `yield [i,o];`))), '\n');

const clauseSrc2 = compileClause(`F`, [`array`, `i`, `o`],
  [Plus(`2`, `3`, `z`),
  Index(`array`, `i`, `o`),
  Range(`0`, `z`, `i`)]);

console.log(clauseSrc2);

console.log('-------');

const clause3 = makeClauseFromOpMaker(`P`, [`x`, `y`, `z`], Plus);

console.log(clause3);

const makeOp3 = makeOpMakerFromClause(clause3);

console.log(makeOp3);
console.log(`${makeOp3}`);

console.log('-------');

const op3 = makeOp3(`7`, `y`, `z`);

console.log(op3);
