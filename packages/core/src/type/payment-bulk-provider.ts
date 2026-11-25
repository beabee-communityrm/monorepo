import type { ContactContribution } from '#models/index';

import type { ContributionStateResult } from './contribution-state.js';
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
  /**
   * Fetch the states of the contributions' subscriptions, mandates and
   * customers
   * @returns The result of each contribution, by contact id
   */
  fetchContributionStates(
    contributions: ContactContribution[],
    opts: PaymentBulkFetchContributionsOpts
  ): Promise<Map<string, ContributionStateResult>>;

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
