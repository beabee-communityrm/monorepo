import type { PaymentMethod } from '../data';

export interface PaymentFlowSetupParamsGoCardless {
  paymentMethod: PaymentMethod.GoCardlessDirectDebit;
  completeUrl: string;
}

export interface PaymentFlowSetupParamsStripe {
  paymentMethod:
    | PaymentMethod.StripeCard
    | PaymentMethod.StripeBACS
    | PaymentMethod.StripeSEPA
    | PaymentMethod.StripePayPal
    | PaymentMethod.StripeIdeal;
}

export type PaymentFlowSetupParams =
  | PaymentFlowSetupParamsGoCardless
  | PaymentFlowSetupParamsStripe;

export interface PaymentFlowAdvanceParamsGoCardless {
  paymentFlowId: string;
}

export interface PaymentFlowAdvanceParamsStripe {
  paymentFlowId: string;
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
