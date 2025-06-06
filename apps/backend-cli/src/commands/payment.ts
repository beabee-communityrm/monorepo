import type { CommandModule } from 'yargs';
import { createPayment } from '../actions/payment/create.js';
import { listPayments } from '../actions/payment/list.js';
import { ContributionPeriod, PaymentMethod } from '@beabee/beabee-common';
import type { ArgumentsCamelCase } from 'yargs';
import type { CreatePaymentArgs } from '../types/payment.js';

export const paymentCommand: CommandModule = {
  command: 'payment <action>',
  describe: 'Payment management commands',
  builder: (yargs) =>
    yargs
      .command({
        command: 'create',
        describe: 'Create a new payment',
        builder: (yargs) =>
          yargs
            .option('email', {
              alias: 'e',
              type: 'string',
              description: 'Contact email',
              demandOption: true,
            })
            .option('method', {
              alias: 'm',
              type: 'string',
              description: 'Payment method',
              default: PaymentMethod.StripeCard,
              choices: Object.values(PaymentMethod),
            })
            .option('amount', {
              alias: 'a',
              type: 'number',
              description: 'Monthly amount in euros',
              default: 10,
            })
            .option('period', {
              alias: 'p',
              type: 'string',
              description: 'Contribution period',
              default: ContributionPeriod.Monthly,
              choices: Object.values(ContributionPeriod),
            })
            .option('payFee', {
              type: 'boolean',
              description: 'Pay processing fee',
              default: false,
            })
            .option('prorate', {
              type: 'boolean',
              description: 'Prorate payment',
              default: false,
            }),
        handler: (argv: ArgumentsCamelCase<CreatePaymentArgs>) =>
          createPayment(argv),
      })
      .command({
        command: 'list [email]',
        describe: 'List payments',
        builder: (yargs) =>
          yargs.positional('email', {
            type: 'string',
            description: 'Filter by contact email',
          }),
        handler: (argv) => listPayments(argv.email as string | undefined),
      }),
  handler: () => {},
};
