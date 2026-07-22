import { ContributionPeriod, ContributionType } from '@beabee/beabee-common';

export interface UpdateContribution {
  type: ContributionType;
  amount: number | undefined;
  period: ContributionPeriod | undefined;
  source: string | undefined;
  reference: string | undefined;
}
