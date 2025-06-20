import type { ArgumentsCamelCase, CommandModule } from 'yargs';

import type { CreateApiKeyArgs, DeleteApiKeyArgs } from '../types/index.js';

export const apiKeyCommand: CommandModule = {
  command: 'api-key <action>',
  describe: 'Manage API keys',
  builder: (yargs) => {
    return yargs
      .command({
        command: 'list',
        describe: 'List all API keys',
        handler: async () => {
          const { listApiKeys } = await import('../actions/api-key/list.js');
          return listApiKeys();
        },
      })
      .command({
        command: 'create',
        describe: 'Create a new API key',
        builder: (yargs) => {
          return yargs
            .option('description', {
              alias: 'd',
              type: 'string',
              describe: 'Description of the API key',
              demandOption: true,
            })
            .option('expires', {
              alias: 'e',
              type: 'string',
              describe: "Expiration date (ISO format) or 'never'",
              default: 'never',
            })
            .option('email', {
              alias: 'm',
              type: 'string',
              describe: 'Email of the user to create the API key for',
              demandOption: true,
            });
        },
        handler: async (argv: ArgumentsCamelCase<CreateApiKeyArgs>) => {
          const { createApiKey } = await import('../actions/api-key/create.js');
          return createApiKey(argv);
        },
      })
      .command({
        command: 'delete <id>',
        describe: 'Delete an API key',
        handler: async (argv: ArgumentsCamelCase<DeleteApiKeyArgs>) => {
          const { deleteApiKey } = await import('../actions/api-key/delete.js');
          return deleteApiKey(argv);
        },
      });
  },
  handler: () => {},
};
