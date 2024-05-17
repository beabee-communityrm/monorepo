import type { PaymentSourceBase } from "./index.ts";
import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceStripeSEPA extends PaymentSourceBase {
  method: PaymentMethod.StripeSEPA;
  country: string;
  bankCode: string;
  branchCode: string;
  last4: string;
}
