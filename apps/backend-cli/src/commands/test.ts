import type { CommandModule } from 'yargs';

export const testCommand: CommandModule = {
  command: 'test',
  describe: 'Test environment commands',
  builder: (yargs) =>
    yargs
      .command({
        command: 'list-users',
        describe: 'List test users with various contribution scenarios',
        handler: async () => {
          const { listTestUsers } =
            await import('../actions/test/list-users.js');
          return listTestUsers();
        },
      })
      .demandCommand(1),
  handler: () => {},
};
