import { PaymentMethod } from '@beabee/beabee-common';

import { PaymentFlow } from '#models';

import { PaymentFlowForm } from './payment-flow-form';

export interface CompletedPaymentFlow<
  TPaymentMethod extends PaymentMethod = PaymentMethod,
  TForm extends PaymentFlowForm = PaymentFlowForm,
> {
  flow: PaymentFlow<TPaymentMethod, TForm>;
  customerId: string;
  mandateId: string;
}
