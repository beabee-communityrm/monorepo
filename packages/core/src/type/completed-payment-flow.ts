import { PaymentFlowParams } from '@beabee/beabee-common';

import type { PaymentFlowForm } from '#type/PaymentFlowForm';

export interface CompletedPaymentFlow<
  TParams extends PaymentFlowParams = PaymentFlowParams,
  TForm extends PaymentFlowForm = PaymentFlowForm,
> {
  params: TParams;
  form: TForm;
  customerId: string;
  mandateId: string;
}
