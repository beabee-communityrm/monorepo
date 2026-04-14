import { PaymentFlowSetupParams } from './payment-flow-params';

export interface CreatePaymentData {
  amount: number;
  payFee: boolean;
  params: PaymentFlowSetupParams;
}
