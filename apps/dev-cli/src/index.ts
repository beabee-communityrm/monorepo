#!/usr/bin/env -S node --experimental-specifier-resolution=node --experimental-strip-types --experimental-transform-types --no-warnings
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import packageJson from '../package.json' with { type: 'json' };
import { esbuildCommand, generateIndexCommand } from './commands/index.ts';

yargs(hideBin(process.argv))
  .command(generateIndexCommand)
  .command(esbuildCommand)
  .demandCommand(1, 'You need at least one command before moving on')
  .version(packageJson.version)
  .scriptName('yarn dev-cli')
  .help()
  .parse();
