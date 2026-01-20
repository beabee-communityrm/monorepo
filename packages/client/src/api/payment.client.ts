import type {
  GetPaymentAggregationData,
  GetPaymentDataWith,
  GetPaymentWith,
  GetPaymentsQuery,
  Paginated,
  Serial,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';
import { ContactClient } from './contact.client.js';

/**
 * Client for managing payments
 * Handles retrieval and listing of payment records
 * @extends BaseClient
 */
export class PaymentClient extends BaseClient {
  /**
   * Creates a new payment client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/payment'),
    });
  }

  /**
   * Deserializes a payment from the server response
   * @param payment - The serialized payment data
   * @returns The deserialized payment with proper date objects
   */
  static deserialize<With extends GetPaymentWith = void>(
    // TODO: how to make this type safe?
    payment: Serial<GetPaymentDataWith<With>> | any
  ): GetPaymentDataWith<With> {
    return {
      ...payment,
      chargeDate: PaymentClient.deserializeDate(payment.chargeDate),
      amount: payment.amount,
      status: payment.status,
      ...(payment.contact !== undefined && {
        contact: payment.contact && ContactClient.deserialize(payment.contact),
      }),
    };
  }

  /**
   * Lists payments with optional filtering
   * @param query - Query parameters for filtering payments
   * @param _with - Optional relations to include
   * @returns A paginated list of payments
   */
  async list<With extends GetPaymentWith = void>(
    query: GetPaymentsQuery = {},
    _with?: readonly With[]
  ): Promise<Paginated<GetPaymentDataWith<With>>> {
    const { data } = await this.fetch.get<
      Paginated<Serial<GetPaymentDataWith<With>>>
    >('', { with: _with, ...query });

    return {
      ...data,
      items: data.items.map((item) => PaymentClient.deserialize(item)),
    };
  }

  /**
   * Aggregate payments with optional filtering
   * @param query - Query parameters for filtering payments
   * @returns A paginated list of payments
   */
  async aggregate(
    query: GetPaymentsQuery = {}
  ): Promise<GetPaymentAggregationData> {
    const { data } = await this.fetch.get<GetPaymentAggregationData>(
      '/aggregate',
      query
    );
    return data;
  }
}
