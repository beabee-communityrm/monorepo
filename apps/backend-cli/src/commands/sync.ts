import moment from 'moment';
import type { ArgumentsCamelCase, CommandModule } from 'yargs';

import { syncMailchimp } from '../actions/sync/mailchimp.js';
import { syncSegments } from '../actions/sync/segments.js';
import { syncStripe } from '../actions/sync/stripe.js';
import type { SyncMailchimpArgs, SyncSegmentsArgs } from '../types/sync.js';

export const syncCommand: CommandModule = {
  command: 'sync <action>',
  describe: 'Synchronization commands',
  builder: (yargs) =>
    yargs
      .command({
        command: 'mailchimp',
        describe: 'Sync newsletter status with Mailchimp',
        builder: (yargs) =>
          yargs
            .option('startDate', {
              type: 'string',
              description: 'Start date (ISO format)',
              default: moment().subtract({ d: 1, h: 2 }).toISOString(), // 26h ago
            })
            .option('endDate', {
              type: 'string',
              description: 'End date (ISO format)',
              default: new Date().toISOString(), // now
            })
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes',
              default: false,
            }),
        handler: (argv: ArgumentsCamelCase<SyncMailchimpArgs>) =>
          syncMailchimp(argv),
      })
      .command({
        command: 'segments',
        describe: 'Process segment memberships',
        builder: (yargs) =>
          yargs
            .option('segmentId', {
              type: 'string',
              description: 'Process specific segment ID',
              required: true,
            })
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes',
              default: false,
            }),
        handler: (argv: ArgumentsCamelCase<SyncSegmentsArgs>) =>
          syncSegments(argv),
      })
      .command({
        command: 'stripe',
        describe: 'Sync Stripe subscriptions and payments',
        builder: (yargs) =>
          yargs.option('dryRun', {
            type: 'boolean',
            description: 'Run without making changes',
            default: false,
          }),
        handler: (argv) => syncStripe(argv.dryRun),
      }),
  handler: () => {},
};
