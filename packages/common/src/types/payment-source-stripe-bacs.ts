import type { PaymentSourceBase } from './index.js';
import type { PaymentMethod } from '../data/index.js';

export interface PaymentSourceStripeBACS extends PaymentSourceBase {
  method: PaymentMethod.StripeBACS;
  sortCode: string;
  last4: string;
}
