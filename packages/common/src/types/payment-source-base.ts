import type { PaymentMethod } from "../data/index.js";

export interface PaymentSourceBase {
  method: PaymentMethod | null;
}
