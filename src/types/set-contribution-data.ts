import type { ContributionPeriod } from "../data/index.ts";

export interface SetContributionData {
  amount: number;
  payFee: boolean;
  prorate: boolean;
  period: ContributionPeriod;
}
