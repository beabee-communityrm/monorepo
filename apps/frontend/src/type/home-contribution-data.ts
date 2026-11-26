import type {
  ContactContributionData,
  GetPaymentData,
} from '@beabee/beabee-common';

/** The member's contribution, as the home page shows it */
export interface HomeContributionData {
  /** The contribution itself */
  info: ContactContributionData;
  /** Their most recent successful payment, for the states that show it */
  lastPayment: GetPaymentData | null;
}
