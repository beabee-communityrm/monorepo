import type { PaymentMethod } from '../data';

export interface PaymentFlowSetupParams {
  paymentMethod: PaymentMethod;
  completeUrl: string;
}

export interface PaymentFlowAdvanceParamsGoCardless {}

export interface PaymentFlowAdvanceParamsStripe {
  token: string;
  firstname?: string;
  lastname?: string;
  vatNumber?: string;
}

export type PaymentFlowAdvanceParams<
  TPaymentMethod extends PaymentMethod = PaymentMethod,
> = TPaymentMethod extends PaymentMethod.GoCardlessDirectDebit
  ? PaymentFlowAdvanceParamsGoCardless
  : PaymentFlowAdvanceParamsStripe;
