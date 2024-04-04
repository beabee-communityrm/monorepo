import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceStripeBACS {
  method: PaymentMethod.StripeBACS;
  sortCode: string;
  last4: string;
}
