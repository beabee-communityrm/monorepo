const { parseDate } = require('../../dist/cjs/index.cjs');
const { strictEqual, deepEqual } = require('assert');

strictEqual(typeof parseDate, 'function', 'parseDate in Node.js CommonJS should be a function');

deepEqual(parseDate("2022"), [new Date(2022, 0), "y"], "date with years has unit years");