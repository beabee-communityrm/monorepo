import type { CommandModule } from 'yargs';

export const databaseCommand: CommandModule = {
  command: 'database <action>',
  describe: 'Database management commands',
  builder: (yargs) =>
    yargs
      .command({
        command: 'export',
        describe:
          'Export database to JSON or SQL dump (contacts always anonymized)',
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
            })
            .option('anonymize', {
              type: 'boolean',
              description:
                'Anonymize all data (contacts are always anonymized)',
              default: true,
            })
            .option('subset', {
              type: 'string',
              description:
                'Export subset: full for all data, demo for subset (400 contacts, 20 latest callouts)',
              default: 'full',
              choices: ['full', 'demo'],
            })
            .option('outputDir', {
              type: 'string',
              description:
                'Path where the file will be dumped. A sub folder will be created called generated-dumps.',
              default: '../../packages/test-utils/database-dumps',
            }),
        handler: async (argv) => {
          const { exportDatabase } = await import(
            '../actions/database/export.js'
          );
          return exportDatabase(argv.dryRun, argv.type as 'json' | 'sql', {
            anonymize: argv.anonymize,
            subset: argv.subset as 'full' | 'demo',
            outputDir: argv.outputDir,
          });
        },
      })
      .command({
        command: 'import [filePath]',
        describe:
          'Import database from JSON or SQL dump file (defaults to test data dump)',
        builder: (yargs) =>
          yargs
            .positional('filePath', {
              type: 'string',
              description:
                'Path to the dump file (.json or .sql). Defaults to database-dump.json or database-dump.sql based on --type',
            })
            .option('type', {
              type: 'string',
              description:
                'Import type: json or sql (auto-detected if not specified)',
              choices: ['json', 'sql'],
            })
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes (JSON only)',
              default: false,
            }),
        handler: async (argv) => {
          const { importDatabase } = await import(
            '../actions/database/import.js'
          );
          return importDatabase(
            argv.filePath as string | undefined,
            argv.type as 'json' | 'sql' | undefined,
            argv.dryRun
          );
        },
      })
      .command({
        command: 'import-callout-responses <calloutSlug> <filePath>',
        describe: 'Import callout responses from CSV file',
        builder: (yargs) =>
          yargs
            .positional('calloutSlug', {
              type: 'string',
              description: 'The slug of the callout to import responses for',
              demandOption: true,
            })
            .positional('filePath', {
              type: 'string',
              description: 'Path to the CSV file',
              demandOption: true,
            }),
        handler: async (argv) => {
          const { importCalloutResponses } = await import(
            '../actions/database/import-callout-responses.js'
          );
          return importCalloutResponses(
            argv.calloutSlug as string,
            argv.filePath as string
          );
        },
      })
      .command({
        command: 'import-steady <filePath>',
        describe: 'Import contacts from Steady CSV export',
        builder: (yargs) =>
          yargs
            .positional('filePath', {
              type: 'string',
              description: 'Path to the Steady CSV export file',
              demandOption: true,
            })
            .option('dryRun', {
              type: 'boolean',
              description: 'Preview import without making changes',
              default: false,
            }),
        handler: async (argv) => {
          const { importSteady } = await import(
            '../actions/database/import-steady.js'
          );
          return importSteady(argv.filePath as string, argv.dryRun);
        },
      }),
  handler: () => {},
};
