interface PaymentFlowParamsGoCardless {
  completeUrl: string;
}

interface PaymentFlowParamsStripe {
  token: string;
  firstName: string;
  lastName: string;
}

export type PaymentFlowParams =
  | PaymentFlowParamsGoCardless
  | PaymentFlowParamsStripe;
