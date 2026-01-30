import type {
  CreatePaymentData,
  GetPaymentData,
  GetPaymentsQuery,
  Paginated,
  PaymentFlowParams,
  Serial,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing contact payment operations
 * Handles payment methods, payment flows, and payment history for contacts
 */
export class ContactPaymentClient extends BaseClient {
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

  async create(dataIn: CreatePaymentData): Promise<PaymentFlowParams> {
    const { data } = await this.fetch.post<Serial<PaymentFlowParams>>(
      '/me/payment',
      {
        amount: dataIn.amount,
        payFee: dataIn.payFee,
        paymentMethod: dataIn.paymentMethod,
        completeUrl: dataIn.completeUrl,
      }
    );
    return data;
  }

  async complete(paymentFlowId: string): Promise<void> {
    await this.fetch.post('/me/payment/complete', {
      paymentFlowId,
    });
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
