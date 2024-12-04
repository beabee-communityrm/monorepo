import type { ContributionPeriod } from '@beabee/beabee-common';

export interface StripePaymentData {
  email: string;
  amount: number;
  period: ContributionPeriod;
}
