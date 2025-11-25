import type { PaymentPeriod } from '@beabee/beabee-common';

export interface StripePaymentData {
  email: string;
  amount: number;
  period: PaymentPeriod;
}
