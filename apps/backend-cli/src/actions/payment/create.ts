import { PaymentMethod } from '@beabee/beabee-common';
import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services';
import { generatePassword } from '@beabee/core/utils/auth';

import type { CreatePaymentArgs } from '../../types/index.js';
import { createStripePayment } from './stripe-create.js';

const TEST_PASSWORD = 'testpass123';
const TEST_FIRSTNAME = 'Test';
const TEST_LASTNAME = 'User';

export const createPayment = async (argv: CreatePaymentArgs): Promise<void> => {
  // Check if environment is development or test
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.NODE_ENV !== 'test'
  ) {
    console.error(
      'Payment creation via CLI is only allowed in development or test environments'
    );
    process.exit(1);
  }

  await runApp(async () => {
    try {
      // Get or create contact
      let contact = await contactsService.findOneBy({ email: argv.email });
      if (!contact) {
        contact = await contactsService.createContact({
          email: argv.email,
          firstname: TEST_FIRSTNAME,
          lastname: TEST_LASTNAME,
          password: await generatePassword(TEST_PASSWORD),
        });
        console.log(
          `Created new contact with email ${argv.email} and password ${TEST_PASSWORD}`
        );
      } else {
        console.log(`Using existing contact with email ${argv.email}`);
      }

      // Handle different payment methods
      switch (argv.method) {
        case PaymentMethod.StripeCard:
          await createStripePayment(contact, argv);
          break;
        default:
          throw new Error(
            `Payment method ${argv.method} is currently not supported`
          );
      }
    } catch (error) {
      console.error('Failed to create payment:', error);
      process.exit(1);
    }
  });
};
