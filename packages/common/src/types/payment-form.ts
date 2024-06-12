import type { ContributionPeriod } from "../data/index.ts";

export interface PaymentForm {
  monthlyAmount: number;
  period: ContributionPeriod;
  payFee: boolean;
  prorate: boolean;
}
