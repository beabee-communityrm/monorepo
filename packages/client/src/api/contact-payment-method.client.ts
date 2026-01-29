import type {
  ContributionInfo,
  PaymentFlowParams,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';
import { ContactContributionClient } from './contact-contribution.client.js';

/**
 * Client for managing contact payment method operations
 */
export class ContactPaymentMethodClient extends BaseClient {
  /**
   * Creates a new contact payment client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/contact'),
    });
  }

  /**
   * Updates a contact's payment method
   * Initiates a payment flow for setting up a new payment method
   * @param paymentMethod - The payment method identifier, or undefined to
   * change payment source but keep the same method (e.g. new card)
   * @returns Payment flow parameters for client-side handling
   */
  async update(
    completeUrl: string,
    paymentMethod?: string
  ): Promise<PaymentFlowParams> {
    const { data } = await this.fetch.put('/me/payment-method', {
      completeUrl,
      paymentMethod,
    });
    return data;
  }

  /**
   * Completes a payment method update flow
   * Called after the payment provider redirects back to the application
   * @param paymentFlowId - The ID of the payment flow to complete
   * @returns Updated contribution information
   */
  async completeUpdate(paymentFlowId: string): Promise<ContributionInfo> {
    const { data } = await this.fetch.post('/me/payment-method/complete', {
      paymentFlowId,
    });
    return ContactContributionClient.deserialize(data);
  }
}
