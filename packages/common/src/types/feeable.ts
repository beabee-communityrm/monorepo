import type { PaymentMethod } from '../data/index.js';
import { type PaymentPeriod } from './payment-period.js';

export interface Feeable {
  amount: number;
  period: PaymentPeriod;
  paymentMethod: PaymentMethod;
}
