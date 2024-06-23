import type { StartContributionData } from '@beabee/beabee-common';

export interface SignupData extends StartContributionData {
  email: string;
  password: string;
  noContribution: boolean;
}
