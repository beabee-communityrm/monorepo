import type { ContributionPeriod } from "../data/index.js";

// TODO: Rename to UpdateContributionData?
export interface SetContributionData {
  amount: number;
  payFee: boolean;
  prorate: boolean;
  period: ContributionPeriod;
}
