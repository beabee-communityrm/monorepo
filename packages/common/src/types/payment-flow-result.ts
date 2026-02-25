export interface PaymentFlowResultGoCardless {
  type: 'gocardless';
  redirectUrl: string;
}

export interface PaymentFlowResultStripe {
  type: 'stripe';
  clientSecret?: string;
}

export interface PaymentFlowResultNone {
  type: 'none';
}

export type PaymentFlowResult =
  | PaymentFlowResultGoCardless
  | PaymentFlowResultStripe
  | PaymentFlowResultNone;
