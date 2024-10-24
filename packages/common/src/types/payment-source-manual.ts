import { PaymentMethod } from "../index.ts";
import type { PaymentSourceBase } from "./index.ts";
export interface PaymentSourceManual extends PaymentSourceBase {
  method: PaymentMethod.Manual;
  source?: string;
  reference?: string;
}
