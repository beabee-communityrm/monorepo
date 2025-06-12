import { deepEqual, strictEqual } from 'assert';

import { parseDate } from '../../../dist/esm/index.js';

const green = (str) => '\x1b[32m' + str + '\x1b[0m';
const red = (str) => '\x1b[31m' + str + '\x1b[0m';

strictEqual(
  typeof parseDate,
  'function',
  `parseDate in Node.js ESM should be a function ${red('ERROR')}`
);

deepEqual(
  parseDate('2022'),
  [new Date(2022, 0), 'y'],
  `date with years has unit years ${red('ERROR')}`
);

console.info(`test/node/import.mjs ${green('OK')}`);
