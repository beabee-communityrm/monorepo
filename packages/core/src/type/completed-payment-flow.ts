import { PaymentFlowParams } from '@beabee/beabee-common';

import type { PaymentFlowForm } from '#models/index';

export interface CompletedPaymentFlow<
  Params extends PaymentFlowParams = PaymentFlowParams,
> {
  params: Params;
  form: PaymentFlowForm;
  customerId: string;
  mandateId: string;
}
