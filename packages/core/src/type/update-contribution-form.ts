import { ContributionPeriod } from '@beabee/beabee-common';

export interface UpdateContributionForm {
  monthlyAmount: number;
  period: ContributionPeriod;
  payFee: boolean;
  prorate?: boolean;
}
