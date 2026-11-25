import type {
  ContributionStates,
  PaymentBulkProvider,
  PaymentRecord,
} from '#type/index';

/**
 * Used when no Stripe secret key is configured
 */
export class NoneBulkProvider implements PaymentBulkProvider {
  isCustomerId(): boolean {
    return false;
  }
  isPaymentId(): boolean {
    return false;
  }
  async fetchContributionStates(): Promise<ContributionStates> {
    return { states: new Map(), failures: [] };
  }
  async fetchPayments(): Promise<PaymentRecord[]> {
    return [];
  }
  async fetchPaymentsByIds(): Promise<Map<string, PaymentRecord | null>> {
    return new Map();
  }
}
