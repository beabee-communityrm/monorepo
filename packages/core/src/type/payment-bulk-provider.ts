import type { ContactContribution } from '#models/index';

import type { ContributionStates } from './contribution-state.js';
import type {
  PaymentBulkFetchContributionsOpts,
  PaymentBulkFetchPaymentsOpts,
} from './payment-bulk-fetch-opts.js';
import type { PaymentRecord } from './payment-record.js';

/**
 * Bulk counterpart of PaymentProvider, used to compare many contributions and
 * payments with the payment provider at once
 */
export interface PaymentBulkProvider {
  /** Whether the id is one of this payment provider's customer ids */
  isCustomerId(id: string): boolean;

  /** Whether the id is one of this payment provider's payment ids */
  isPaymentId(id: string): boolean;

  /**
   * Fetch the states of the contributions' subscriptions, mandates and
   * customers
   */
  fetchContributionStates(
    contributions: ContactContribution[],
    opts: PaymentBulkFetchContributionsOpts
  ): Promise<ContributionStates>;

  /**
   * Fetch the payments created in the given range. The account can be shared
   * with other integrations, so these can include payments that aren't ours.
   */
  fetchPayments(opts: PaymentBulkFetchPaymentsOpts): Promise<PaymentRecord[]>;

  /**
   * Fetch the given payments
   * @returns Each payment by id, null if it no longer exists
   */
  fetchPaymentsByIds(ids: string[]): Promise<Map<string, PaymentRecord | null>>;
}
