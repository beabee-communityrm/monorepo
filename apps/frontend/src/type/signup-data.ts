import type { StartContributionData } from '@type';

export interface SignupData extends StartContributionData {
  email: string;
  password: string;
  noContribution: boolean;
}
