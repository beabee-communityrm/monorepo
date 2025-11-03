import { ContributionPeriod } from '../data/index.js';

export interface PaymentForm {
  monthlyAmount: number;
  period: ContributionPeriod | 'one-time';
  payFee: boolean;
  prorate: boolean;
}
