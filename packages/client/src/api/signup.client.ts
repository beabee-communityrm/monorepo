import {
  type CompleteSignupData,
  PaymentFlowAdvanceParams,
  type PaymentFlowSetupResult,
  type Serial,
  type SignupData,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing user signup and registration
 */
export class SignupClient extends BaseClient {
  /**
   * The URL to complete the signup process
   */
  readonly completeUrl: string;

  /**
   * Creates a new signup client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/signup'),
    });
    this.completeUrl = options.host + '/join/complete';
  }

  /**
   * Initiates the signup process for a new user
   * @param data - The signup data including email and contribution details
   * @returns Payment flow parameters for completing signup
   */
  async start(data: SignupData): Promise<PaymentFlowSetupResult | undefined> {
    const { data: responseData } = await this.fetch.post<
      Serial<PaymentFlowSetupResult> | undefined
    >('', {
      ...data,
      loginUrl: this.options.host + '/auth/login',
      setPasswordUrl: this.options.host + '/auth/set-password',
      confirmUrl: this.options.host + '/join/confirm-email',
    });
    return responseData;
  }

  /**
   * Advances the signup process with user details
   * @param params - The completion data including name and payment details
   */
  async advance(
    paymentFlowId: string,
    params?: PaymentFlowAdvanceParams
  ): Promise<void> {
    await this.fetch.post('/advance', { paymentFlowId, params });
  }

  /**
   * Completes the signup process for a user
   * @param id - The signup ID
   */
  async complete(id: string): Promise<void> {
    await this.fetch.post('/complete', { id });
  }
}
