import type { CommandModule } from 'yargs';

export const databaseCommand: CommandModule = {
  command: 'database <action>',
  describe: 'Database management commands',
  builder: (yargs) =>
    yargs
      .command({
        command: 'export',
        describe: 'Export database to SQL dump (contacts always anonymized)',
        builder: (yargs) =>
          yargs
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes',
              default: false,
            })
            .option('anonymize', {
              type: 'boolean',
              description:
                'Anonymize all data (contacts are always anonymized)',
              default: true,
            })
            .option('skipAnonymizeTables', {
              type: 'array',
              string: true,
              description:
                'Table names to export without anonymisation (e.g. contact, segment)',
              default: [],
            }),
        handler: async (argv) => {
          const { exportDatabase } = await import(
            '../actions/database/export.js'
          );
          return exportDatabase(
            argv.dryRun,
            argv.anonymize,
            argv.skipAnonymizeTables ?? []
          );
        },
      })
      .command({
        command: 'export-demo',
        describe:
          'Export demo subset (limited contacts, latest callouts, anonymized)',
        builder: (yargs) =>
          yargs.option('dryRun', {
            type: 'boolean',
            description: 'Run without making changes',
            default: false,
          }),
        handler: async (argv) => {
          const { exportDemoDatabase } = await import(
            '../actions/database/export-demo.js'
          );
          return exportDemoDatabase(argv.dryRun);
        },
      })
      .command({
        command: 'import',
        describe:
          'Import database from a SQL dump (dev only; use export output)',
        builder: (yargs) =>
          yargs
            .option('file', {
              type: 'string',
              description: 'Path to dump file (default: read from stdin)',
            })
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes',
              default: false,
            }),
        handler: async (argv) => {
          const { importDatabase } = await import(
            '../actions/database/import.js'
          );
          return importDatabase(argv.file, argv.dryRun);
        },
      }),
  handler: () => {},
};
