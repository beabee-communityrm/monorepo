import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing payment flows
 */
export class PaymentFlowClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/payment-flow'),
    });
  }

  /**
   * Gets the status of a payment flow
   * @param id - The payment flow ID
   * @returns The payment flow status
   */
  async get(id: string): Promise<string> {
    const { data } = await this.fetch.get<string>(`/${id}`);
    return data;
  }
}
