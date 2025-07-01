#!/usr/bin/env -S node --experimental-specifier-resolution=node --experimental-strip-types --experimental-transform-types --no-warnings
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  esbuildCommand,
  generateIndexCommand,
  mcpCommand,
  translationCommand,
} from './commands/index.ts';
import { packageJson } from './utils/package.ts';

yargs(hideBin(process.argv))
  .command(generateIndexCommand)
  .command(esbuildCommand)
  .command(mcpCommand)
  .command(translationCommand)
  .demandCommand(1, 'You need at least one command before moving on')
  .version(packageJson.version)
  .scriptName('yarn dev-cli')
  .help()
  .parse();
