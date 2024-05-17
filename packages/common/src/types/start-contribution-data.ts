import type { PaymentMethod } from "../data/index.ts";
import type { SetContributionData } from "./index.ts";

export interface StartContributionData extends SetContributionData {
  paymentMethod: PaymentMethod;
}
