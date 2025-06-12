import type { PaymentSourceBase } from './index.js';

export interface PaymentSourceManual extends PaymentSourceBase {
  method: null;
  source?: string;
  reference?: string;
}
