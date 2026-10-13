import { type PaymentFlowSetupParams } from '../index.js';

export interface CreatePaymentData {
  amount: number;
  payFee: boolean;
  params: PaymentFlowSetupParams;
}
