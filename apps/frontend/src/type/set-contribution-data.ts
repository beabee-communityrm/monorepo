import type { ContributionPeriod } from '@beabee/beabee-common';

export interface SetContributionData {
  amount: number;
  payFee: boolean;
  prorate: boolean;
  period: ContributionPeriod;
}
