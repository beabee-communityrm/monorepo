import type { CommandModule } from 'yargs';

export const healthCommand: CommandModule = {
  command: 'health <integration>',
  describe: 'Check the health of the app and its integrations',
  builder: (yargs) =>
    yargs
      .command({
        command: 'document',
        describe: 'Check the document storage integration',
        handler: async () => {
          const { checkHealth } = await import('../actions/health.js');
          return checkHealth(['document']);
        },
      })
      .command({
        command: 'image',
        describe: 'Check the image storage integration',
        handler: async () => {
          const { checkHealth } = await import('../actions/health.js');
          return checkHealth(['image']);
        },
      })
      .command({
        command: 'all',
        describe: 'Check all integrations',
        handler: async () => {
          const { checkHealth } = await import('../actions/health.js');
          return checkHealth();
        },
      }),
  handler: () => {},
};
