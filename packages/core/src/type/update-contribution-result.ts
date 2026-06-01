import { ContributionPeriod } from '@beabee/beabee-common';

export interface UpdateContributionResult {
  expiryDate: Date;
  monthlyAmount: number | undefined;
  period: ContributionPeriod;
}
