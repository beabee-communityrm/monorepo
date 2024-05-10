import type { PaymentSourceBase } from "./index.ts";
import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceStripeBACS extends PaymentSourceBase {
  method: PaymentMethod.StripeBACS;
  sortCode: string;
  last4: string;
}
