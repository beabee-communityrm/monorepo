#!/usr/bin/env -S node --experimental-specifier-resolution=node --experimental-strip-types --no-warnings
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { esbuildCommand, generateIndexCommand } from './commands/index.ts';
import { packageJson } from './utils/package.ts';

yargs(hideBin(process.argv))
  .command(generateIndexCommand)
  .command(esbuildCommand)
  .demandCommand(1, 'You need at least one command before moving on')
  .version(packageJson.version)
  .scriptName('yarn dev-cli')
  .help()
  .parse();
