import { PaymentFlow } from '#models';

export interface CompletedPaymentFlow {
  flow: PaymentFlow;
  customerId: string;
  mandateId: string;
}
