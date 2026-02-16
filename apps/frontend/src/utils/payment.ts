import { type StripeFeeCountry, calcPaymentFee } from '@beabee/beabee-common';

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
