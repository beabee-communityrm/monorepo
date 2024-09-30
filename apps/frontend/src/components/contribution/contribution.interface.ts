import type { ContentJoinData } from '@beabee/beabee-common';

export type ContributionContent = Pick<
  ContentJoinData,
  | 'initialAmount'
  | 'initialPeriod'
  | 'minMonthlyAmount'
  | 'showAbsorbFee'
  | 'periods'
  | 'paymentMethods'
>;
