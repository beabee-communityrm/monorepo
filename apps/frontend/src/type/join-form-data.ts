import type { PaymentMethod, PaymentPeriod } from '@beabee/beabee-common';

export interface JoinFormData {
  email: string;
  amount: number;
  period: PaymentPeriod;
  payFee: boolean;
  prorate: boolean;
  paymentMethod: PaymentMethod;
  noContribution: boolean;
}
