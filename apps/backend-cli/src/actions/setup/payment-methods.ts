import { getRepository } from '@beabee/core/database';
import { Content } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';

import { checkbox } from '@inquirer/prompts';

import type { SetupPaymentMethodsArgs } from '../../types/setup.js';

/**
 * Set up payment methods in the join content
 * Accepts command line arguments or prompts for missing information
 */
export const setupPaymentMethods = async (
  args: SetupPaymentMethodsArgs = {}
): Promise<void> => {
  try {
    console.log('Setting up payment methods configuration...\n');

    // Get payment methods from arguments or prompt for them
    const paymentMethods =
      args.paymentMethods ||
      (await checkbox({
        message: 'Select payment methods to enable:',
        choices: [
          { name: 'Stripe Card Payments', value: 's_card', checked: true },
          { name: 'Stripe SEPA Direct Debit', value: 's_sepa', checked: true },
          { name: 'Stripe BACS Direct Debit', value: 's_bacs', checked: true },
          { name: 'Stripe PayPal', value: 's_paypal', checked: true },
          {
            name: 'GoCardless Direct Debit',
            value: 'gc_direct-debit',
            checked: true,
          },
        ],
        validate: (input: readonly any[]) => {
          if (input.length === 0) {
            return 'At least one payment method must be selected';
          }
          return true;
        },
      }));

    await runApp(async () => {
      // Update payment methods in join content
      await getRepository(Content).update('join', {
        data: () =>
          `jsonb_set(data, '{paymentMethods}', '${JSON.stringify(
            paymentMethods
          )}')`,
      });

      console.log('Payment methods configuration updated successfully!');
      console.log('Payment methods updated to:', paymentMethods.join(', '));
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ExitPromptError'
    ) {
      console.log('\nOperation cancelled by user.');
      return;
    }
    throw error;
  }
};
