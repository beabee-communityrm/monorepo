import type { CommandModule } from 'yargs';
import type { ArgumentsCamelCase } from 'yargs';

import { configure } from '../actions/configure.js';
import type { ConfigureArgs } from '../types/configure.js';

export const configureCommand: CommandModule<{}, ConfigureArgs> = {
  command: 'configure',
  describe: 'Configure system settings',
  builder: (yargs) => {
    return yargs
      .option('emailDomain', {
        alias: 'e',
        type: 'string',
        describe: 'Email domain for support email',
        demandOption: true,
      })
      .option('paymentMethods', {
        alias: 'p',
        type: 'array',
        describe: 'List of payment methods to enable',
        choices: ['s_card', 's_sepa', 's_bacs', 's_paypal', 'gc_direct-debit'],
        default: ['s_card', 's_sepa', 's_bacs', 's_paypal', 'gc_direct-debit'],
      });
  },
  handler: (argv: ArgumentsCamelCase<ConfigureArgs>) => configure(argv),
};
