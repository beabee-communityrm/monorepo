import type { ContributionPeriod, PaymentMethod } from '../data/index.js';

export interface Feeable {
  amount: number;
  period: ContributionPeriod;
  paymentMethod: PaymentMethod;
}
