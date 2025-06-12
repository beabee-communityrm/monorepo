import type { PaymentMethod } from '../data/index.js';
import type { PaymentSourceBase } from './index.js';

export interface PaymentSourceStripeBACS extends PaymentSourceBase {
  method: PaymentMethod.StripeBACS;
  sortCode: string;
  last4: string;
}
