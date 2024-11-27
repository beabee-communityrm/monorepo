import type { ContributionPeriod } from "../data/index.ts";

// TODO: Rename to UpdateContributionData?
export interface SetContributionData {
  amount: number;
  payFee: boolean;
  prorate: boolean;
  period: ContributionPeriod;
}
