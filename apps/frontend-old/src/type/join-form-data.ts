import type { PaymentMethod, PaymentPeriod } from '@beabee/beabee-common';

/**
 * Data structure for the join/signup form.
 */
export interface JoinFormData {
  /** User's email address */
  email: string;
  /** Contribution amount in base currency */
  amount: number;
  /** Payment period */
  period: PaymentPeriod;
  /** Whether user absorbs payment processing fee */
  payFee: boolean;
  /** Whether to prorate the contribution */
  prorate: boolean;
  /** Selected payment method */
  paymentMethod: PaymentMethod;
  /** Whether user opts out of contribution */
  noContribution: boolean;
}
