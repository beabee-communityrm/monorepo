import type {
  PaymentBulkProvider,
  ProviderContributionResult,
  ProviderPayment,
} from '#type/index';

/**
 * Used when no Stripe secret key is configured
 */
export class NoneBulkProvider implements PaymentBulkProvider {
  async fetchContributionStates(): Promise<
    Map<string, ProviderContributionResult>
  > {
    return new Map();
  }
  async fetchPayments(): Promise<ProviderPayment[]> {
    return [];
  }
  async fetchPaymentsByIds(): Promise<Map<string, ProviderPayment | null>> {
    return new Map();
  }
}
