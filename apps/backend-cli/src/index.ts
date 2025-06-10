#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  apiKeyCommand,
  configureCommand,
  migrateUploadsCommand,
  paymentCommand,
  processCommand,
  syncCommand,
  testCommand,
  userCommand,
} from './commands/index.js';
import './env.js';

const pkg = JSON.parse(
  readFileSync(resolve(process.cwd(), './package.json'), 'utf8')
);

yargs(hideBin(process.argv))
  .command(apiKeyCommand)
  .command(userCommand)
  .command(configureCommand)
  .command(paymentCommand)
  .command(processCommand)
  .command(syncCommand)
  .command(testCommand)
  .command(migrateUploadsCommand)
  .demandCommand(1, 'You need at least one command before moving on')
  .version(pkg.version)
  .scriptName('yarn backend-cli')
  .help()
  .parse();
