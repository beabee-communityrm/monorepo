import type { PaymentFlowForm } from '#type/PaymentFlowForm';

export interface CompletedPaymentFlow<
  TForm extends PaymentFlowForm = PaymentFlowForm,
> {
  form: TForm;
  customerId: string;
  mandateId: string;
}
