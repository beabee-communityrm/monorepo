import type { PaymentSourceBase } from "./index.ts";
export interface PaymentSourceManual extends PaymentSourceBase {
  method: null;
  source?: string;
  reference?: string;
}
