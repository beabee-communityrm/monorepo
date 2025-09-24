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
          const { listTestUsers } = await import(
            '../actions/test/list-users.js'
          );
          return listTestUsers(argv.dryRun);
        },
      })
      .command({
        command: 'anonymise',
        describe: 'Create anonymized copy of database and export data to SQL dump',
        builder: (yargs) =>
          yargs.option('dryRun', {
            type: 'boolean',
            description: 'Run without making changes',
            default: false,
          }),
        handler: async () => {
          const { runAnonymisers } = await import(
            '../actions/test/anonymise.js'
          );
          return runAnonymisers();
        },
      }),
  handler: () => {},
};
