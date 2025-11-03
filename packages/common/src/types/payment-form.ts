import { PaymentPeriod } from './payment-period.js';

export interface PaymentForm {
  monthlyAmount: number;
  period: PaymentPeriod;
  payFee: boolean;
  prorate: boolean;
}
