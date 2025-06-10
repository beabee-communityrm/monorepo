import type { PaymentMethod } from '../data/index.js';
import type { PaymentSourceBase } from './index.js';

export interface PaymentSourceGoCardlessDirectDebit extends PaymentSourceBase {
  method: PaymentMethod.GoCardlessDirectDebit;
  bankName: string;
  accountHolderName: string;
  accountNumberEnding: string;
}
