import type { ContentJoinData } from '@beabee/beabee-common';

/**
 * Configuration for ont time payment components
 * Contains all the necessary data for rendering one time payment forms
 */
export type OneTimePaymentContent = Pick<
  ContentJoinData,
  'initialAmount' | 'minMonthlyAmount' | 'showAbsorbFee' | 'paymentMethods'
>;
