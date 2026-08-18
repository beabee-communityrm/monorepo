#!/usr/bin/env node
import { ActivityActor, ActivityActorType } from '@beabee/beabee-common';
import { actorContext } from '@beabee/core/lib/actor-context';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  apiKeyCommand,
  databaseCommand,
  emailCommand,
  healthCommand,
  imageCommand,
  migrateUploadsCommand,
  paymentCommand,
  processCommand,
  rateLimiterCommand,
  setupCommand,
  syncCommand,
  testCommand,
  userCommand,
} from './commands/index.js';
import './env.js';

const pkg = JSON.parse(
  readFileSync(resolve(process.cwd(), './package.json'), 'utf8')
);

// Use backend-cli as default actor
const actor: ActivityActor = {
  actorType: ActivityActorType.BackendCLI,
  actorId: null,
};

actorContext.run(actor, () =>
  yargs(hideBin(process.argv))
    .option('actor', {
      choices: [ActivityActorType.BackendCLI, ActivityActorType.Cron],
      default: ActivityActorType.BackendCLI,
      description: 'Actor type for activity feed',
    })
    .middleware((argv) => {
      actor.actorType = argv.actor;
    })
    .command(apiKeyCommand)
    .command(databaseCommand)
    .command(emailCommand)
    .command(userCommand)
    .command(setupCommand)
    .command(healthCommand)
    .command(imageCommand)
    .command(paymentCommand)
    .command(processCommand)
    .command(rateLimiterCommand)
    .command(syncCommand)
    .command(testCommand)
    .command(migrateUploadsCommand)
    .demandCommand(1, 'You need at least one command before moving on')
    .version(pkg.version)
    .scriptName('yarn backend-cli')
    .help()
    .parse()
);
