import type { CommandModule } from 'yargs';

import type {
  AnonymizationLevel,
  CalloutAnonymizationLevel,
  DumpFormat,
} from '../types/index.js';

const DUMP_FORMATS: readonly DumpFormat[] = ['sql', 'json'] as const;

const ANONYMIZATION_LEVELS: readonly AnonymizationLevel[] = [
  'full',
  'safe',
  'test',
  'none',
] as const;

const CALLOUT_ANONYMIZATION_LEVELS: readonly CalloutAnonymizationLevel[] = [
  'full',
  'none',
] as const;

export const databaseCommand: CommandModule = {
  command: 'database <action>',
  describe: 'Database management commands',
  builder: (yargs) =>
    yargs
      .command({
        command: 'export',
        describe: 'Export database to SQL dump (see --anonymize levels)',
        builder: (yargs) =>
          yargs
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes',
              default: false,
            })
            .option('anonymize', {
              choices: ANONYMIZATION_LEVELS,
              description:
                "Anonymisation level: 'full' (default, all data anonymised), 'safe' (contacts/payments/emails/segments anonymised, other tables raw), 'test' (all data except email, content and options anonymized), 'none' (DANGEROUS: everything raw, including PII — for local migration testing only).",
              default: 'full' as AnonymizationLevel,
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
            .option('format', {
              choices: DUMP_FORMATS,
              description: 'Output format: sql (default) or json.',
              default: 'sql' as DumpFormat,
            }),
        handler: async (argv) => {
          const { exportDatabase } =
            await import('../actions/database/export.js');
          return exportDatabase(argv);
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
            .option('contactLimit', {
              type: 'number',
              description:
                'Maximum number of contacts to include in the demo export',
              default: 400,
            })
            .option('calloutLimit', {
              type: 'number',
              description:
                'Maximum number of callouts to include in the demo export',
              default: 20,
            }),
        handler: async (argv) => {
          const { exportDemoDatabase } =
            await import('../actions/database/export-demo.js');
          return exportDemoDatabase(argv);
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
              choices: CALLOUT_ANONYMIZATION_LEVELS,
              description:
                "Anonymisation level: 'full' (default, personal data anonymised — guest names/emails, contact FKs) or 'none' (everything raw, for migration testing). Callout content and answers are always preserved.",
              default: 'full' as CalloutAnonymizationLevel,
            })
            .option('preserveCalloutAnswers', {
              type: 'boolean',
              description:
                'Keep callout response answers intact instead of anonymizing per component. Defaults to true for this command.',
              default: true,
            })
            .option('calloutSlug', {
              type: 'array',
              string: true,
              description:
                'Export only specific callouts by slug (can be specified multiple times).',
              default: [] as string[],
            }),
        handler: async (argv) => {
          const { exportCalloutsDatabase } =
            await import('../actions/database/export-callouts.js');
          return exportCalloutsDatabase(argv);
        },
      })
      .command({
        command: 'import',
        describe:
          'Import database from a SQL dump (dev only; use export output)',
        builder: (yargs) =>
          yargs
            .option('dryRun', {
              type: 'boolean',
              description: 'Run without making changes',
              default: false,
            })
            .option('format', {
              choices: DUMP_FORMATS,
              description: 'Input format: sql (default) or json.',
              default: 'sql' as DumpFormat,
            }),
        handler: async (argv) => {
          const { importDatabase } =
            await import('../actions/database/import.js');
          return importDatabase(argv);
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
          const { importCalloutResponses } =
            await import('../actions/database/import-callout-responses.js');
          return importCalloutResponses(argv);
        },
      })
      .command({
        command: 'clean',
        describe: 'Clean old data from the database',
        handler: async () => {
          const { cleanDatabase } =
            await import('../actions/database/clean.js');
          return cleanDatabase();
        },
      }),
  handler: () => {},
};
