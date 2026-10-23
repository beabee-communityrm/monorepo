import type { ArgumentsCamelCase, Argv, CommandModule } from 'yargs';

import { EVENT_BACKFILL_CATEGORIES } from '../constants/event.js';
import type { BackfillEventsArgs } from '../types/index.js';

export const eventCommand: CommandModule = {
  command: 'event <action>',
  describe: 'Manage activity feed events',
  builder: (yargs) =>
    yargs
      .command({
        command: 'backfill <category>',
        describe:
          'Backfill activity events for a category, or all categories with "all"',
        builder: (yargs) =>
          yargs
            .positional('category', {
              describe: 'The category of events to backfill',
              choices: ['all', ...EVENT_BACKFILL_CATEGORIES],
              demandOption: true,
            })
            .option('dryRun', {
              type: 'boolean',
              describe: 'Run without making changes',
              default: false,
            }) as Argv<BackfillEventsArgs>,
        handler: async (argv: ArgumentsCamelCase<BackfillEventsArgs>) => {
          const { backfillEvents } =
            await import('../actions/event/backfill.js');
          return backfillEvents(argv);
        },
      })
      .demandCommand(1),
  handler: () => {},
};
