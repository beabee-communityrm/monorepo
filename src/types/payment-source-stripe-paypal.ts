import type { PaymentSourceBase } from "./index.ts";
import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceStripePayPal extends PaymentSourceBase {
  method: PaymentMethod.StripePayPal;
  payerEmail: string;
  payerId: string;
}
