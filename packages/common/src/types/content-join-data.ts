import type { ContributionPeriod, PaymentMethod } from "../data/index.ts";

import type { StripeFeeCountry } from "./index.ts";

export interface ContentJoinData {
  title: string;
  subtitle: string;
  initialAmount: number;
  initialPeriod: ContributionPeriod;
  minMonthlyAmount: number;
  presetAmounts: {
    [ContributionPeriod.Monthly]: number[];
    [ContributionPeriod.Annually]: number[];
  };
  paymentMethods: PaymentMethod[];

  showAbsorbFee: boolean;
  showNoContribution: boolean;

  /** @deprecated Use {@link ContentPaymentData.stripePublicKey} instead. */
  stripePublicKey: string;
  /** @deprecated Use {@link ContentPaymentData.stripeCountry} instead. */
  stripeCountry: StripeFeeCountry;
}
