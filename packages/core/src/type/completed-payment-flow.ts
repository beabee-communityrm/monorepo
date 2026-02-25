import { PaymentFlowParams } from '@beabee/beabee-common';

import type { JoinForm } from '#models/index';

export interface CompletedPaymentFlow<
  Params extends PaymentFlowParams = PaymentFlowParams,
> {
  paymentFlowParams: Params;
  joinForm: JoinForm;
  customerId: string;
  mandateId: string;
}
