import type { PaymentMethod } from '../data/index.js';

export interface PaymentFlowParamsGoCardless {
  paymentMethod: PaymentMethod.GoCardlessDirectDebit;
  completeUrl: string;
}

export interface PaymentFlowParamsStripe {
  paymentMethod:
    | PaymentMethod.StripeCard
    | PaymentMethod.StripeBACS
    | PaymentMethod.StripeSEPA
    | PaymentMethod.StripePayPal
    | PaymentMethod.StripeIdeal;
  completeUrl: string;
  firstname?: string;
  lastname?: string;
  vatNumber?: string;
}

export type PaymentFlowParams =
  | PaymentFlowParamsGoCardless
  | PaymentFlowParamsStripe;
