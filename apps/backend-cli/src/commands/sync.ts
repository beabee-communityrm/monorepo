import type { CommandModule } from 'yargs';

import { SYNC_NEWSLETTER_RECONCILE_TESTS } from '../constants/sync.js';
import { coerceToDate } from '../utils/coerce.js';

export const syncCommand: CommandModule = {
  command: 'sync <action>',
  describe: 'Synchronization commands',
  builder: (yargs) =>
    yargs
      .command({
        command: 'newsletter-service',
        describe: 'Sync data with the newsletter service',
        builder: (yargs) =>
          yargs
            .command({
              command: 'active-member-tag',
              describe:
                'Remove expired active member tags from the newsletter service',
              builder: (yargs) =>
                yargs
                  .option('since', {
                    type: 'string',
                    description:
                      'Sync changes since date or duration (ISO format)',
                    coerce: coerceToDate,
                    demandOption: true,
                  })
                  .option('until', {
                    type: 'string',
                    description:
                      'Sync changes until date or duration (ISO format)',
                    coerce: coerceToDate,
                    default: () => new Date(),
                  })
                  .option('dryRun', {
                    type: 'boolean',
                    description: 'Run without making changes',
                    default: false,
                  }),
              handler: async (argv) => {
                const { syncActiveMemberTag } = await import(
                  '../actions/sync/newsletters/active-member-tag.js'
                );
                return syncActiveMemberTag(argv);
              },
            })
            .command({
              command: 'reconcile',
              describe: 'Reconcile changes from the newsletter service',
              builder: (yargs) =>
                yargs
                  .option('dryRun', {
                    type: 'boolean',
                    description: 'Run without making changes',
                    default: false,
                  })
                  .option('report', {
                    type: 'boolean',
                    description: 'Generate a report of the differences found',
                    default: false,
                  })
                  .option('uploadNew', {
                    type: 'boolean',
                    description:
                      'Upload new contacts to the newsletter service',
                    default: false,
                  })
                  .option('fix', {
                    type: 'array',
                    description: 'The tests to run and fix',
                    choices: SYNC_NEWSLETTER_RECONCILE_TESTS,
                    demandOption: true,
                  })
                  .option('since', {
                    type: 'string',
                    description:
                      'Sync changes since date or duration (ISO format)',
                    coerce: coerceToDate,
                  })
                  .option('until', {
                    type: 'string',
                    description:
                      'Sync changes until date or duration (ISO format)',
                    coerce: coerceToDate,
                  }),
              handler: async (argv) => {
                const { reconcile } = await import(
                  '../actions/sync/newsletters/reconcile.js'
                );
                return reconcile(argv);
              },
            }),
        handler: () => {},
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
        handler: async (argv) => {
          const { syncSegments } = await import('../actions/sync/segments.js');
          return syncSegments(argv);
        },
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
        handler: async (argv) => {
          const { syncStripe } = await import('../actions/sync/stripe.js');
          return syncStripe(argv.dryRun);
        },
      }),
  handler: () => {},
};
