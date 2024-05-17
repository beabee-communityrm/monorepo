import type { ContributionPeriod, PaymentMethod } from '@beabee/beabee-common';

import type { ContentJoinPeriodData } from './index';

export interface ContentJoinData {
  title: string;
  subtitle: string;
  initialAmount: number;
  initialPeriod: ContributionPeriod;
  minMonthlyAmount: number;
  periods: ContentJoinPeriodData[];
  showAbsorbFee: boolean;
  showNoContribution: boolean;
  paymentMethods: PaymentMethod[];
}
