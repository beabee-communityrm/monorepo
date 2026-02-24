interface PaymentFlowResultGoCardless {
  type: 'gocardless';
  redirectUrl: string;
}

interface PaymentFlowResultStripe {
  type: 'stripe';
  clientSecret?: string;
}

interface PaymentFlowResultNone {
  type: 'none';
}

export type PaymentFlowResult =
  | PaymentFlowResultGoCardless
  | PaymentFlowResultStripe
  | PaymentFlowResultNone;
