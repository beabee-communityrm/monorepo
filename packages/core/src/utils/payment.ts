import {
  ContributionPeriod,
  ContributionType,
  PaymentForm,
  PaymentMethod,
  calcPaymentFee,
} from '@beabee/beabee-common';

import { addMonths, getYear, setYear, sub } from 'date-fns';

import config from '#config/config';
import { Contact } from '#models/index';

export function getActualAmount(
  monthlyAmount: number,
  period: ContributionPeriod | 'one-time'
): number {
  // TODO: fix this properly
  return Math.round(
    monthlyAmount * (period === ContributionPeriod.Annually ? 12 : 1)
  );
}

/**
 * Calculate the amount to charge including the payment fee if applicable
 *
 * @param paymentForm The payment form
 * @param paymentMethod The payment method
 * @returns The chargeable amount in cents
 */
export function getChargeableAmount(
  paymentForm: PaymentForm,
  paymentMethod: PaymentMethod
): number {
  const amount = getActualAmount(paymentForm.monthlyAmount, paymentForm.period);
  const fee = paymentForm.payFee
    ? calcPaymentFee(
        { amount, period: paymentForm.period, paymentMethod },
        config.stripe.country
      )
    : 0;
  return Math.round((amount + fee) * 100);
}

/**
 * Calculate the contact's membership renewal date based on their membership
 * expiry date or start date if they are a non-expiring member
 *
 * @param contact The contact to calculate for
 * @returns The renewal date or undefined if they are not a member
 */
export function calcRenewalDate(
  contact: Contact,
  now?: Date
): Date | undefined {
  if (
    !contact.membership?.isActive ||
    contact.contributionType === ContributionType.None
  ) {
    return;
  }

  now = now || new Date();

  let renewalDate: Date;

  if (contact.membership.dateExpires) {
    // Simple case, use their expiry date
    renewalDate = sub(contact.membership.dateExpires, config.gracePeriod);
  } else if (contact.contributionPeriod === ContributionPeriod.Annually) {
    // Annual contribution, calculate based on their start date
    const thisYear = getYear(now);
    // Find the next time their renewal occurs (either later this year or next year)
    const startDate = setYear(contact.membership.dateAdded, thisYear);
    renewalDate =
      startDate <= now ? setYear(startDate, thisYear + 1) : startDate;
  } else {
    // Monthly contribution, give them a 1 month grace period
    renewalDate = addMonths(now, 1);
  }

  // Ensure date is no more than 1 period away from now, this could happen if
  // manual contributors had their expiry date set arbritarily in the future
  const maxDate = addMonths(
    now,
    contact.contributionPeriod === ContributionPeriod.Annually ? 12 : 1
  );
  return renewalDate > maxDate ? maxDate : renewalDate;
}
