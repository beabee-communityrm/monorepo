import type { Argv, CommandModule } from 'yargs';
import type { ArgumentsCamelCase } from 'yargs';

import type {
  DeleteOptionArgs,
  GetOptionArgs,
  SetOptionArgs,
} from '../types/index.js';

export const optionCommand: CommandModule = {
  command: 'option <action>',
  describe: 'Manage options in the options table',
  builder: (yargs) => {
    return yargs
      .command({
        command: 'get',
        describe: 'Get option value(s)',
        builder: (yargs) =>
          yargs
            .option('key', {
              type: 'string',
              description: 'The option key to get',
            })
            .option('all', {
              type: 'boolean',
              description: 'Get all options',
              default: false,
            })
            .check((argv) => {
              if (!argv.key && !argv.all) {
                throw new Error('Either --key or --all must be provided');
              }
              return true;
            }) as Argv<GetOptionArgs>,
        handler: async (argv: ArgumentsCamelCase<GetOptionArgs>) => {
          const { getOption } = await import('../actions/option/get.js');
          return getOption(argv);
        },
      })
      .command({
        command: 'set',
        describe: 'Set an option value',
        builder: (yargs) =>
          yargs
            .option('key', {
              type: 'string',
              description: 'The option key to set',
              demandOption: true,
            })
            .option('value', {
              type: 'string',
              description: 'The value to set',
              demandOption: true,
            }) as Argv<SetOptionArgs>,
        handler: async (argv: ArgumentsCamelCase<SetOptionArgs>) => {
          const { setOption } = await import('../actions/option/set.js');
          return setOption(argv);
        },
      })
      .command({
        command: 'delete',
        describe: 'Delete (reset to default) an option',
        builder: (yargs) =>
          yargs.option('key', {
            type: 'string',
            description: 'The option key to delete',
            demandOption: true,
          }) as Argv<DeleteOptionArgs>,
        handler: async (argv: ArgumentsCamelCase<DeleteOptionArgs>) => {
          const { deleteOption } = await import('../actions/option/delete.js');
          return deleteOption(argv);
        },
      });
  },
  handler: () => {},
};
