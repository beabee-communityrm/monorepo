import config from '#config/config';
import { log as mainLogger } from '#logging';
import type { ContactContribution } from '#models/index';
import {
  NoneBulkProvider,
  StripeBulkProvider,
} from '#providers/payment-bulk/index';
import type {
  ContributionStates,
  PaymentBulkFetchContributionsOpts,
  PaymentBulkFetchPaymentsOpts,
  PaymentBulkProvider,
  PaymentRecord,
} from '#type/index';

const log = mainLogger.child({ app: 'payment-bulk-service' });

/**
 * Bulk counterpart of PaymentService, used to compare our contributions and
 * payments with the payment provider
 */
class PaymentBulkService {
  private readonly provider: PaymentBulkProvider = config.stripe.secretKey
    ? new StripeBulkProvider()
    : new NoneBulkProvider();

  get isEnabled(): boolean {
    return !!config.stripe.secretKey;
  }

  /**
   * Fetch the states of the contributions' subscriptions, mandates and
   * customers
   *
   * @param contributions The contributions
   * @param opts Which states to fetch
   */
  async fetchContributionStates(
    contributions: ContactContribution[],
    opts: PaymentBulkFetchContributionsOpts
  ): Promise<ContributionStates> {
    log.info(`Fetch the states of ${contributions.length} contributions`);
    return await this.provider.fetchContributionStates(contributions, opts);
  }

  /**
   * Fetch the payments created in the given range. These can include
   * payments that aren't ours.
   *
   * @param opts Which payments to fetch
   */
  async fetchPayments(
    opts: PaymentBulkFetchPaymentsOpts
  ): Promise<PaymentRecord[]> {
    log.info('Fetch payments');
    return await this.provider.fetchPayments(opts);
  }

  /**
   * Fetch the given payments
   *
   * @param ids The payment ids
   * @returns Each payment by id, null if it no longer exists
   */
  async fetchPaymentsByIds(
    ids: string[]
  ): Promise<Map<string, PaymentRecord | null>> {
    log.info(`Fetch ${ids.length} payments`);
    return await this.provider.fetchPaymentsByIds(ids);
  }
}

export const paymentBulkService = new PaymentBulkService();
export default PaymentBulkService;
