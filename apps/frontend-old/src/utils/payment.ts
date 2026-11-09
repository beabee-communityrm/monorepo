import { type StripeFeeCountry, calcPaymentFee } from '@beabee/beabee-common';

import { loadStripe } from '@stripe/stripe-js/pure';

import type { JoinFormData } from '#type/join-form-data';

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
 * Complete a payment that needs further action from the user, e.g. a 3D Secure
 * challenge, by handing the intent to Stripe.js.
 * @param clientSecret The client secret of the intent that needs the action
 * @param stripePublicKey The Stripe public key
 */
export async function handlePaymentNextAction(
  clientSecret: string,
  stripePublicKey: string
): Promise<void> {
  const stripe = await loadStripe(stripePublicKey);
  if (!stripe) {
    throw new Error('Failed to load Stripe.js');
  }

  const { error } = await stripe.handleNextAction({ clientSecret });
  if (error) {
    throw new Error(error.message);
  }
}
