import type {
  ContributionInfo,
  GetPaymentData,
  GetPaymentsQuery,
  Paginated,
  PaymentFlowParams,
  Serial,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';
import { ContactContributionClient } from './contact-contribution.client.js';

/**
 * Client for managing contact payment operations
 * Handles payment methods, payment flows, and payment history for contacts
 */
export class ContactPaymentClient extends BaseClient {
  completeUrl: string;

  /**
   * Creates a new contact payment client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/contact'),
    });
    this.completeUrl =
      options.host + '/profile/contribution/payment-method/complete';
  }

  /**
   * Updates a contact's payment method
   * Initiates a payment flow for setting up a new payment method
   * @param paymentMethod - The payment method identifier, or undefined to remove
   * @returns Payment flow parameters for client-side handling
   */
  async update(paymentMethod?: string): Promise<PaymentFlowParams> {
    const { data } = await this.fetch.put('/me/payment-method', {
      paymentMethod,
      completeUrl: this.completeUrl,
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

  /**
   * Lists payment history for a contact
   * Includes payment status, amounts, and dates
   * @param id - The contact ID
   * @param query - Query parameters for filtering payments
   * @returns Paginated list of payment data
   */
  async list(
    id: string,
    query: GetPaymentsQuery = {}
  ): Promise<Paginated<GetPaymentData>> {
    const { data } = await this.fetch.get<Serial<Paginated<GetPaymentData>>>(
      `/${id}/payment`,
      query
    );
    return {
      ...data,
      items: data.items.map((item) => ({
        chargeDate: ContactPaymentClient.deserializeDate(item.chargeDate),
        amount: item.amount,
        status: item.status,
      })),
    };
  }
}
