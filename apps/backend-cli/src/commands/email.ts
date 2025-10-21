import type { CommandModule } from 'yargs';

import type {
  CreateEmailOverrideArgs,
  DeleteEmailOverrideArgs,
  ListEmailOverridesArgs,
} from '../types/index.js';

export const emailCommand: CommandModule = {
  command: 'email <action>',
  describe: 'Manage email template overrides',
  builder: (yargs) => {
    return yargs
      .command({
        command: 'list [template]',
        describe: 'List email template overrides',
        builder: (yargs) =>
          yargs.positional('template', {
            type: 'string',
            description: 'Filter by specific template ID',
          }),
        handler: async (argv) => {
          const { listEmailOverrides } = await import(
            '../actions/email/list.js'
          );
          return listEmailOverrides(argv as ListEmailOverridesArgs);
        },
      })
      .command({
        command: 'create',
        describe: 'Create an email template override',
        builder: (yargs) => {
          return yargs
            .option('template', {
              alias: 't',
              type: 'string',
              describe: 'Template ID to override',
              demandOption: true,
            })
            .option('subject', {
              alias: 's',
              type: 'string',
              describe: 'Email subject',
              demandOption: true,
            })
            .option('body', {
              alias: 'b',
              type: 'string',
              describe: 'Email body (supports merge fields)',
              demandOption: true,
            })
            .option('fromName', {
              alias: 'n',
              type: 'string',
              describe: 'From name (optional)',
            })
            .option('fromEmail', {
              alias: 'e',
              type: 'string',
              describe: 'From email (optional)',
            })
            .option('force', {
              alias: 'f',
              type: 'boolean',
              describe: 'Skip template ID validation (for testing)',
              default: false,
            });
        },
        handler: async (argv) => {
          const { createEmailOverride } = await import(
            '../actions/email/create.js'
          );
          return createEmailOverride(argv as CreateEmailOverrideArgs);
        },
      })
      .command({
        command: 'delete <template>',
        describe: 'Delete an email template override',
        builder: (yargs) => {
          return yargs
            .positional('template', {
              type: 'string',
              describe: 'Template ID to delete override for',
              demandOption: true,
            })
            .option('force', {
              alias: 'f',
              type: 'boolean',
              describe: 'Skip template ID validation (for testing)',
              default: false,
            });
        },
        handler: async (argv) => {
          const { deleteEmailOverride } = await import(
            '../actions/email/delete.js'
          );
          return deleteEmailOverride(argv as DeleteEmailOverrideArgs);
        },
      });
  },
  handler: () => {},
};
