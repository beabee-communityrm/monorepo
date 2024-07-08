import { calcPaymentFee, ContributionPeriod, PaymentForm, PaymentMethod } from "@beabee/beabee-common";
import config from "#config/config";

export function getActualAmount(
  amount: number,
  period: ContributionPeriod
): number {
  // TODO: fix this properly
  return Math.round(amount * (period === ContributionPeriod.Annually ? 12 : 1));
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
