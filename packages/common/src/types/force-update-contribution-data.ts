import type { ContributionPeriod, ContributionType } from "../data/index.ts";

export interface ForceUpdateContributionData {
  type: ContributionType.Manual | ContributionType.None;
  amount: number | undefined;
  period: ContributionPeriod | undefined;
  source?: string;
  reference?: string;
}
