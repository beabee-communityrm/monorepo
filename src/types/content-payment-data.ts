import { StripeFeeCountry } from "./index.ts";

export interface ContentPaymentData {
  stripePublicKey: string;
  stripeCountry: StripeFeeCountry;
  taxRateEnabled: boolean;
  taxRate: number;
}
