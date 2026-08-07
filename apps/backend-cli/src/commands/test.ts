import type { CommandModule } from 'yargs';

export const testCommand: CommandModule = {
  command: 'test <action>',
  describe: 'Test environment commands',
  builder: (yargs) =>
    yargs
      .command({
        command: 'list-users',
        describe: 'List test users with various contribution scenarios',
        builder: (yargs) =>
          yargs.option('dryRun', {
            type: 'boolean',
            description: 'Run without making changes',
            default: false,
          }),
        handler: async (argv) => {
          const { listTestUsers } =
            await import('../actions/test/list-users.js');
          return listTestUsers(argv.dryRun);
        },
      })
      .command({
        command: 'seed-map-preview-callout',
        describe:
          'Create a single open callout with the map response view enabled and several mapped guest responses',
        handler: async () => {
          const { seedMapPreviewCallout } =
            await import('../actions/test/seed-map-preview-callout.js');
          return seedMapPreviewCallout();
        },
      }),
  handler: () => {},
};
