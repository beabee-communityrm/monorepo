import type { ContributionPeriod, PaymentMethod } from "../data/index.ts";

import type { StripeFeeCountry } from "./index.ts";

export interface ContentJoin {
  title: string;
  subtitle: string;
  initialAmount: number;
  initialPeriod: ContributionPeriod;
  minMonthlyAmount: number;
  periods: {
    name: ContributionPeriod;
    presetAmounts: number[];
  }[];
  showAbsorbFee: boolean;
  showNoContribution: boolean;
  paymentMethods: PaymentMethod[];
  stripePublicKey: string;
  stripeCountry: StripeFeeCountry;
}
