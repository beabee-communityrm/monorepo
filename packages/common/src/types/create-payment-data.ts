import { PaymentMethod } from '../data/index.js';

export interface CreatePaymentData {
  amount: number;
  payFee: boolean;
  paymentMethod: PaymentMethod;
  completeUrl: string;
}
