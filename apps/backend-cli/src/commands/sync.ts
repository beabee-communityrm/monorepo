import moment from 'moment';
import type { CommandModule } from 'yargs';

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
                  .option('updateThem', {
                    type: 'boolean',
                    description:
                      'Update the newsletter service to match our records',
                    default: false,
                  })
                  .option('report', {
                    type: 'boolean',
                    description: 'Generate a report of the differences found',
                    default: false,
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
