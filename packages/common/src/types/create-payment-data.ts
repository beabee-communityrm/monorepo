import { PaymentMethod } from '../data';
import { PaymentFlowParams } from './payment-flow-params';

export interface CreatePaymentData {
  amount: number;
  payFee: boolean;
  paymentMethod: PaymentMethod;
  paymentFlowParams: PaymentFlowParams;
}
