import type { CommandModule } from 'yargs';

export const healthCommand: CommandModule = {
  command: 'health <integration>',
  describe: 'Check the health of the app and its integrations',
  builder: (yargs) =>
    yargs
      .option('notify', {
        type: 'boolean',
        describe: 'Send log notifications',
        default: false,
      })
      .command({
        command: 'document',
        describe: 'Check the document storage integration',
        handler: async (argv) => {
          const { checkHealth } = await import('../actions/health.js');
          return checkHealth(['document'], argv.notify as boolean);
        },
      })
      .command({
        command: 'image',
        describe: 'Check the image storage integration',
        handler: async (argv) => {
          const { checkHealth } = await import('../actions/health.js');
          return checkHealth(['image'], argv.notify as boolean);
        },
      })
      .command({
        command: 'newsletter',
        describe: 'Check the newsletter integration',
        handler: async (argv) => {
          const { checkHealth } = await import('../actions/health.js');
          return checkHealth(['newsletter'], argv.notify as boolean);
        },
      })
      .command({
        command: 'payment',
        describe: 'Check the payment integrations',
        handler: async (argv) => {
          const { checkHealth } = await import('../actions/health.js');
          return checkHealth(['payment'], argv.notify as boolean);
        },
      })
      .command({
        command: 'email',
        describe: 'Check the email integration',
        handler: async (argv) => {
          const { checkHealth } = await import('../actions/health.js');
          return checkHealth(['email'], argv.notify as boolean);
        },
      })
      .command({
        command: 'all',
        describe: 'Check all integrations',
        handler: async (argv) => {
          const { checkHealth } = await import('../actions/health.js');
          return checkHealth(undefined, argv.notify as boolean);
        },
      }),
  handler: () => {},
};
