import type { ContentJoinData } from '@beabee/beabee-common';

/**
 * Configuration for contribution components
 * Contains all the necessary data for rendering contribution forms
 */
export type ContributionContent = Pick<
  ContentJoinData,
  | 'initialAmount'
  | 'initialPeriod'
  | 'minMonthlyAmount'
  | 'showAbsorbFee'
  | 'periods'
  | 'paymentMethods'
>;
