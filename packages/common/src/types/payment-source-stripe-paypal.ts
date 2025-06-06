import type { PaymentSourceBase } from './index.js';
import type { PaymentMethod } from '../data/index.js';

export interface PaymentSourceStripePayPal extends PaymentSourceBase {
  method: PaymentMethod.StripePayPal;
  payerEmail: string;
  payerId: string;
}
