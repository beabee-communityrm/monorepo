import { ContributionPeriod } from '../data';

export interface ContributionForm {
  monthlyAmount: number;
  period: ContributionPeriod;
  payFee: boolean;
  prorate: boolean;
}
