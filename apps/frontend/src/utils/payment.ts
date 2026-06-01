import { type StripeFeeCountry, calcPaymentFee } from '@beabee/beabee-common';
import { PaymentRequiresActionError } from '@beabee/client';

import { loadStripe } from '@stripe/stripe-js/pure';

import type { JoinFormData } from '#type/join-form-data';

import { client } from './api';

/**
 * Calculate the total amount for the join form, including fees if applicable.
 * @param data The join form data
 * @param country The country for fee calculation
 * @returns The total amount including fees
 */
export function calcJoinFormTotalAmount(
  data: JoinFormData,
  country: StripeFeeCountry
): number {
  const totalAmount =
    data.amount + (data.payFee ? calcPaymentFee(data, country) : 0);
  return totalAmount;
}

/**
 * Wrap a function that may throw a PaymentRequiresActionError and handle it by
 * invoking Stripe.js to complete the required action.
 *
 * @param fn The function to wrap
 * @param stripePublicKey The Stripe public key to use for payment processing, or it will be fetched from the API if not provided
 */
export async function handlePossiblePaymentRequiresAction(
  fn: () => Promise<unknown>,
  stripePublicKey?: string
): Promise<void> {
  try {
    await fn();
  } catch (err) {
    if (!(err instanceof PaymentRequiresActionError)) {
      throw err;
    }

    if (!stripePublicKey) {
      stripePublicKey = (await client.content.get('payment')).stripePublicKey;
    }

    const stripe = await loadStripe(stripePublicKey);
    if (!stripe) {
      throw new Error('Failed to load Stripe.js');
    }

    const { error: actionError } = await stripe.handleNextAction({
      clientSecret: err.clientSecret,
    });

    if (actionError) {
      throw actionError;
    }
  }
}
