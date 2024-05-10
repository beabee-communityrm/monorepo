import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceBase {
  method: PaymentMethod | null;
}
