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
        describe:
          'Create anonymized copy of database and export data to SQL dump',
        builder: (yargs) =>
          yargs.option('dryRun', {
            type: 'boolean',
            description: 'Run without making changes',
            default: false,
          }),
        handler: async (argv) => {
          const { runAnonymisers } = await import(
            '../actions/test/anonymise.js'
          );
          return runAnonymisers(argv.dryRun);
        },
      })
      .command({
        command: 'seed',
        describe: 'Seed the database with test data from a Json dump file',
        builder: (yargs) =>
          yargs
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes',
              default: false,
            })
            .option('fileName', {
              type: 'string',
              description: 'JSON dump file name',
              default: undefined,
            }),
        handler: async (argv) => {
          const { seed } = await import('../actions/test/seed.js');
          return seed(argv.dryRun, argv.fileName);
        },
      }),
  handler: () => {},
};
