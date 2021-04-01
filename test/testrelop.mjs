// @ts-check

// @ts-ignore
import { compile, modes, Plus, Range, Index } from '../src/relop.mjs';
// @ts-ignore
import { indent } from '../src/indent.mjs';

console.log(
  Plus(`2`, `3`, `z`).IIO(
    Range(`0`, `z`, `i`).IIO(
      Index(`array`, `i`, `o`).IIO(
        `yield [i,o];`))));

const clause = compile(`F`, [`array`, `i`, `o`],
                        [Plus(`2`, `3`, `z`),
                        Index(`array`, `i`, `o`),
                        Range(`0`, `z`, `i`)]);

console.log(''+clause);

for (let clMode of modes(clause)) {
  console.log(indent`
  ${clMode}: ${clause[clMode]}`);
}
