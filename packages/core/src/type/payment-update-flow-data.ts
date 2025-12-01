import { ContributionPeriod, PaymentMethod } from '@beabee/beabee-common';

export interface PaymentUpdateFlowData {
  paymentMethod: PaymentMethod;
  completeUrl: string;
  amount?: number;
  period?: ContributionPeriod;
  payFee?: boolean;
  prorate?: boolean;
}
