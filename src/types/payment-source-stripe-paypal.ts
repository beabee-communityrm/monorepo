import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceStripePayPal {
  method: PaymentMethod.StripePayPal;
  payerEmail: string;
  payerId: string;
}
