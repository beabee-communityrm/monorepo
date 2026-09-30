import type { CommandModule } from 'yargs';

export const idpCommand: CommandModule = {
  command: 'idp <action>',
  describe: 'Manage the identity provider',
  builder: (yargs) => {
    return yargs.command({
      command: 'setup',
      describe:
        'Apply the login policy, notification policy and branding to the identity provider',
      handler: async () => {
        const { setupIdp } = await import('../actions/idp/setup.js');
        return setupIdp();
      },
    });
  },
  handler: () => {},
};
