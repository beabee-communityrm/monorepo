import { ContributionPeriod, PaymentMethod } from '@beabee/beabee-common';

export interface CreatePaymentArgs {
  email: string;
  method: PaymentMethod;
  amount: number;
  period: ContributionPeriod;
  payFee: boolean;
  prorate: boolean;
}
