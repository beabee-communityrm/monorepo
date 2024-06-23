import type { ContributionPeriod, PaymentMethod } from "../data/index.ts";

import type { ContentJoinPeriodData, StripeFeeCountry } from "./index.ts";

export interface ContentJoinData {
  title: string;
  subtitle: string;
  initialAmount: number;
  initialPeriod: ContributionPeriod;
  minMonthlyAmount: number;
  periods: ContentJoinPeriodData[];
  showAbsorbFee: boolean;
  showNoContribution: boolean;
  paymentMethods: PaymentMethod[];
  /** @deprecated Use {@link ContentPaymentData.stripePublicKey} instead. */
  stripePublicKey?: string;
  /** @deprecated Use {@link ContentPaymentData.stripeCountry} instead. */
  stripeCountry?: StripeFeeCountry;
}
