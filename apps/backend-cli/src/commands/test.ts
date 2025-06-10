import type { CommandModule } from 'yargs';

import { listTestUsers } from '../actions/test/list-users.js';

export const testCommand: CommandModule = {
  command: 'test <action>',
  describe: 'Test environment commands',
  builder: (yargs) =>
    yargs.command({
      command: 'list-users',
      describe: 'List test users with various contribution scenarios',
      builder: (yargs) =>
        yargs.option('dryRun', {
          type: 'boolean',
          description: 'Run without making changes',
          default: false,
        }),
      handler: (argv) => listTestUsers(argv.dryRun),
    }),
  handler: () => {},
};
