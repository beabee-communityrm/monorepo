import type { PaymentMethod } from "../data/index.ts";

export interface PaymentSourceStripeSEPA {
  method: PaymentMethod.StripeSEPA;
  country: string;
  bankCode: string;
  branchCode: string;
  last4: string;
}
