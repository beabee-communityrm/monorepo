#!/usr/bin/env -S node --experimental-specifier-resolution=node --experimental-strip-types --no-warnings
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  esbuildCommand,
  generateIndexCommand,
  mcpCommand,
} from './commands/index.ts';

const pkg = JSON.parse(
  readFileSync(resolve(process.cwd(), './package.json'), 'utf8')
);

yargs(hideBin(process.argv))
  .command(generateIndexCommand)
  .command(esbuildCommand)
  .command(mcpCommand)
  .demandCommand(1, 'You need at least one command before moving on')
  .version(pkg.version)
  .scriptName('yarn dev-cli')
  .help()
  .parse();
