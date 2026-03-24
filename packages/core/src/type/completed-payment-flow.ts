import type { PaymentFlowForm } from '#models/index';

export interface CompletedPaymentFlow {
  form: PaymentFlowForm;
  customerId: string;
  mandateId: string;
}
