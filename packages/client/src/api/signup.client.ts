import {
  type CompleteSignupData,
  ContributionPeriod,
  type PaymentFlowParams,
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
  async start(data: SignupData): Promise<PaymentFlowParams | undefined> {
    const { data: responseData } = await this.fetch.post<
      Serial<PaymentFlowParams> | undefined
    >('', {
      ...data,
      loginUrl: this.options.host + '/auth/login',
      setPasswordUrl: this.options.host + '/auth/set-password',
      confirmUrl: this.options.host + '/join/confirm-email',
    });
    return responseData;
  }

  /**
   * Completes the signup process with user details
   * @param data - The completion data including name and payment details
   */
  async complete(data: CompleteSignupData): Promise<void> {
    await this.fetch.post('/complete', {
      paymentFlowId: data.paymentFlowId,
      firstname: data.firstname,
      lastname: data.lastname,
      vatNumber: data.vatNumber,
    });
  }

  /**
   * Confirms a user's email address
   * @param joinFlowId - The join flow ID from the confirmation email
   */
  async confirmEmail(joinFlowId: string | string[]): Promise<void> {
    await this.fetch.post('/confirm-email', { joinFlowId });
  }
}
