import type {
  ContributionStateResult,
  PaymentBulkProvider,
  PaymentRecord,
} from '#type/index';

/**
 * Used when no Stripe secret key is configured
 */
export class NoneBulkProvider implements PaymentBulkProvider {
  async fetchContributionStates(): Promise<
    Map<string, ContributionStateResult>
  > {
    return new Map();
  }
  async fetchPayments(): Promise<PaymentRecord[]> {
    return [];
  }
  async fetchPaymentsByIds(): Promise<Map<string, PaymentRecord | null>> {
    return new Map();
  }
}
