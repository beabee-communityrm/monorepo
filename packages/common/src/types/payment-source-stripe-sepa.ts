import type { PaymentMethod } from '../data/index.js';
import type { PaymentSourceBase } from './index.js';

export interface PaymentSourceStripeSEPA extends PaymentSourceBase {
  method: PaymentMethod.StripeSEPA;
  country: string;
  bankCode: string;
  branchCode: string;
  last4: string;
}
