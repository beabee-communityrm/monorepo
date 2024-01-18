import { parseDate } from '../../dist/esm/index.js';
import { strictEqual, deepEqual } from 'assert';

strictEqual(typeof parseDate, 'function', 'parseDate in Node.js ESM should be a function');

deepEqual(parseDate("2022"), [new Date(2022, 0), "y"], "date with years has unit years");
