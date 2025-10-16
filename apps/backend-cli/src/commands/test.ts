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
          'Create fully anonymized copy of database and export data to Json or SQL dump.',
        builder: (yargs) =>
          yargs
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes.',
              default: false,
            })
            .option('type', {
              type: 'string',
              description: 'Export type: json or sql. Default is json.',
              default: 'json',
            }),
        handler: async (argv) => {
          const { exportDatabase } = await import(
            '../actions/database/export.js'
          );
          return exportDatabase(argv.dryRun, argv.type as 'json' | 'sql', true);
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
      })
      .command({
        command: 'export-demo',
        describe:
          'Export demo database with subset of data (400 contacts, 20 latest callouts)',
        builder: (yargs) =>
          yargs
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes',
              default: false,
            })
            .option('type', {
              type: 'string',
              description: 'Export type: json or sql',
              default: 'json',
              choices: ['json', 'sql'],
            }),
        handler: async (argv) => {
          const { exportDemo } = await import('../actions/test/export-demo.js');
          return exportDemo(argv.dryRun, argv.type as 'json' | 'sql');
        },
      }),
  handler: () => {},
};
