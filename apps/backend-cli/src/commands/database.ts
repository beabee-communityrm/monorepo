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
                'Anonymize all data (contacts are always anonymized). This includes a preset of tables that are always anonymized (contacts, etc.), when turning off anonymisation.',
              default: true,
            })
            .option('skipAnonymizeTables', {
              type: 'array',
              string: true,
              description:
                'Table names to export without anonymisation (e.g. segment). Allows turning off single tables explicitly.',
              default: [],
            })
            .option('preserveCalloutAnswers', {
              type: 'boolean',
              description:
                'Keep callout response answers intact instead of anonymizing per component. Contact FKs and guest data are still anonymized.',
              default: false,
            })
            .option('file', {
              type: 'string',
              description:
                'Write output to this file instead of stdout (avoids TypeORM log pollution)',
            }),
        handler: async (argv) => {
          const { exportDatabase } = await import(
            '../actions/database/export.js'
          );
          return exportDatabase(
            argv.dryRun,
            argv.anonymize,
            argv.skipAnonymizeTables ?? [],
            argv.preserveCalloutAnswers,
            argv.file
          );
        },
      })
      .command({
        command: 'export-demo',
        describe:
          'Export demo subset (limited contacts, latest callouts, anonymized)',
        builder: (yargs) =>
          yargs
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes',
              default: false,
            })
            .option('file', {
              type: 'string',
              description:
                'Write output to this file instead of stdout (avoids TypeORM log pollution)',
            }),
        handler: async (argv) => {
          const { exportDemoDatabase } = await import(
            '../actions/database/export-demo.js'
          );
          return exportDemoDatabase(argv.dryRun, argv.file);
        },
      })
      .command({
        command: 'export-callouts',
        describe:
          'Export callout data only (for migration testing). Keeps form schemas and answers intact.',
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
                'Anonymize personal data (guest names/emails, contact FKs). Callout content and answers are always preserved.',
              default: true,
            })
            .option('preserveCalloutAnswers', {
              type: 'boolean',
              description:
                'Keep callout response answers intact instead of anonymizing per component. Defaults to true for this command.',
              default: true,
            })
            .option('file', {
              type: 'string',
              description:
                'Write output to this file instead of stdout (avoids TypeORM log pollution)',
            })
            .option('callout-slug', {
              type: 'array',
              string: true,
              description:
                'Export only specific callouts by slug (can be specified multiple times). No DELETE statements emitted; use --merge on import.',
              default: [] as string[],
            }),
        handler: async (argv) => {
          const { exportCalloutsDatabase } = await import(
            '../actions/database/export-callouts.js'
          );
          return exportCalloutsDatabase(
            argv.dryRun,
            argv.anonymize,
            argv.preserveCalloutAnswers,
            argv.file,
            argv.calloutSlug
          );
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
            })
            .option('merge', {
              type: 'boolean',
              description:
                'Merge imported data with existing data instead of replacing. Skips DELETE statements and ignores duplicate key conflicts.',
              default: false,
            }),
        handler: async (argv) => {
          const { importDatabase } = await import(
            '../actions/database/import.js'
          );
          return importDatabase(argv.file, argv.dryRun, argv.merge);
        },
      })
      .command({
        command: 'import-callout-responses <slug>',
        describe:
          'Import callout responses from CSV (headers must be slideId.componentKey).',
        builder: (yargs) =>
          yargs
            .positional('slug', {
              type: 'string',
              demandOption: true,
              description: 'Slug of the target callout',
            })
            .option('file', {
              type: 'string',
              description: 'Path to CSV file (default: read from stdin)',
            })
            .option('dryRun', {
              type: 'boolean',
              description:
                'Parse and report what would be imported, but do not write to the database.',
              default: false,
            })
            .option('failOnUnknown', {
              type: 'boolean',
              description:
                'Abort on any unknown label rather than logging a warning and continuing.',
              default: false,
            })
            .option('dateFormat', {
              type: 'string',
              description:
                'Moment format string for the created_at column. Default ISO. Examples: "DD.MM.YYYY HH:mm:ss" (European), "M.D.YYYY H:mm:ss" (US Google Forms export).',
              default: 'YYYY-MM-DDTHH:mm:ss',
            }),
        handler: async (argv) => {
          const { importCalloutResponses } = await import(
            '../actions/database/import-callout-responses.js'
          );
          return importCalloutResponses({
            slug: argv.slug as string,
            dryRun: argv.dryRun as boolean,
            failOnUnknown: argv.failOnUnknown as boolean,
            dateFormat: argv.dateFormat as string,
            ...(argv.file ? { file: argv.file as string } : {}),
          });
        },
      })
      .command({
        command: 'clean',
        describe: 'Clean old data from the database',
        handler: async () => {
          const { cleanDatabase } = await import(
            '../actions/database/clean.js'
          );
          return cleanDatabase();
        },
      }),
  handler: () => {},
};
