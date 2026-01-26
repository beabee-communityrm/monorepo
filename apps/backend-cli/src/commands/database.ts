import type { CommandModule } from 'yargs';

export const databaseCommand: CommandModule = {
  command: 'database <action>',
  describe: 'Database management commands',
  builder: (yargs) =>
    yargs.command({
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
            description: 'Anonymize all data (contacts are always anonymized)',
            default: true,
          })
          .option('subset', {
            type: 'string',
            description:
              'Export subset: full for all data, demo for subset (400 contacts, 20 latest callouts)',
            default: 'full',
            choices: ['full', 'demo'],
          }),
      handler: async (argv) => {
        const { exportDatabase } = await import(
          '../actions/database/export.js'
        );
        return exportDatabase(
          argv.dryRun,
          argv.type as 'json' | 'sql',
          argv.anonymize,
          argv.subset as 'full' | 'demo'
        );
      },
    }),
  handler: () => {},
};
