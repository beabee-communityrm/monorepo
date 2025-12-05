import { PaymentMethod } from '../data';

export interface CreatePaymentData {
  amount: number;
  payFee: boolean;
  paymentMethod: PaymentMethod;
  completeUrl: string;
}
