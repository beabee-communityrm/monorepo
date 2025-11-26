import type { PaymentMethod } from '../data';

export interface CreateOneTimePaymentData {
  amount: number;
  payFee: boolean;
  paymentMethod: PaymentMethod;
  completeUrl: string;
}
