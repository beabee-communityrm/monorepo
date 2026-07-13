import type { Argv, CommandModule } from 'yargs';
import type { ArgumentsCamelCase } from 'yargs';

import type {
  CreateUserArgs,
  DeleteUserArgs,
  LinkUserArgs,
  ListUserArgs,
} from '../types/index.js';

export const userCommand: CommandModule = {
  command: 'user <action>',
  describe: 'Manage users',
  builder: (yargs) => {
    return yargs
      .command({
        command: 'list [email]',
        describe: 'List users',
        builder: (yargs) =>
          yargs
            .positional('email', {
              type: 'string',
              description: 'Filter by email',
            })
            .option('without-password', {
              type: 'boolean',
              description: 'Only show users without a password set',
              default: false,
            }) as Argv<ListUserArgs>,
        handler: async (argv: ArgumentsCamelCase<ListUserArgs>) => {
          const { listUsers } = await import('../actions/user/list.js');
          return listUsers(argv);
        },
      })
      .command({
        command: 'create',
        describe: 'Create a new user',
        builder: (yargs) => {
          return yargs
            .option('firstname', {
              alias: 'f',
              type: 'string',
              describe: 'First name',
              demandOption: true,
            })
            .option('lastname', {
              alias: 'l',
              type: 'string',
              describe: 'Last name',
              demandOption: true,
            })
            .option('email', {
              alias: 'e',
              type: 'string',
              describe: 'Email address',
              demandOption: true,
            })
            .option('password', {
              alias: 'p',
              type: 'string',
              describe:
                'Password (leave empty to generate reset password link)',
              default: '',
            })
            .option('membership', {
              alias: 'm',
              describe: 'Membership type',
              choices: ['none', 'permanent', 'monthly', 'expired'],
              default: 'permanent',
            })
            .option('role', {
              alias: 'r',
              describe: 'User role',
              choices: ['none', 'admin', 'superadmin'],
              default: 'superadmin',
            }) as Argv<CreateUserArgs>;
        },
        handler: async (argv: ArgumentsCamelCase<CreateUserArgs>) => {
          const { createUser } = await import('../actions/user/create.js');
          return createUser(argv);
        },
      })

      .command({
        command: 'provision',
        describe:
          'Create identity provider users for all unlinked contacts and link them',
        handler: async () => {
          const { provisionUsers } =
            await import('../actions/user/provision.js');
          return provisionUsers();
        },
      })
      .command({
        command: 'link',
        describe: 'Link existing contacts to identity provider users',
        builder: (yargs) =>
          yargs
            .option('csv', {
              type: 'string',
              description: 'CSV file of email,subject pairs to link',
            })
            .option('from-idp', {
              type: 'boolean',
              description:
                'Look up each unlinked contact by email at the identity provider',
              default: false,
            })
            .check((argv) => {
              if (!argv.csv && !argv.fromIdp) {
                throw new Error('Either --csv or --from-idp must be provided');
              }
              return true;
            }) as Argv<LinkUserArgs>,
        handler: async (argv: ArgumentsCamelCase<LinkUserArgs>) => {
          const { linkUsers } = await import('../actions/user/link.js');
          return linkUsers(argv);
        },
      })
      .command({
        command: 'delete [email]',
        describe: 'Permanently delete user(s)',
        builder: (yargs) =>
          yargs
            .positional('email', {
              type: 'string',
              description: 'Email of the user to delete',
            })
            .option('without-password', {
              type: 'boolean',
              description: 'Delete all users without a password set',
              default: false,
            })
            .option('force', {
              alias: 'y',
              type: 'boolean',
              description: 'Skip confirmation prompt',
              default: false,
            })
            .check((argv) => {
              if (!argv.email && !argv.withoutPassword) {
                throw new Error(
                  'Either email or --without-password must be provided'
                );
              }
              return true;
            }) as Argv<DeleteUserArgs>,
        handler: async (argv: ArgumentsCamelCase<DeleteUserArgs>) => {
          const { deleteUsers } = await import('../actions/user/delete.js');
          return deleteUsers(argv);
        },
      });
  },
  handler: () => {},
};
