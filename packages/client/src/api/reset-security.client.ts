import { BaseClient } from './base.client.js';
import type { BaseClientOptions } from '../types/index.js';
import {
  type CreateResetDeviceData,
  type CreateResetPasswordData,
  RESET_SECURITY_FLOW_TYPE,
  type UpdateResetDeviceData,
  type UpdateResetPasswordData,
} from '@beabee/beabee-common';

/**
 * Client for managing security reset flows
 * Handles password reset and device reset operations
 * @extends BaseClient
 */
export class ResetSecurityClient extends BaseClient {
  /**
   * Creates a new reset security client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super(options);
  }

  /**
   * Starts the reset password flow
   * Used when a user has forgotten their password
   * @param email - The email of the user
   */
  async resetPasswordBegin(email: string): Promise<void> {
    const data: CreateResetPasswordData = {
      email,
      resetUrl: this.options.host + '/auth/reset-password',
    };
    await this.fetch.post('reset-password', data);
  }

  /**
   * Completes the reset password flow
   * Used after the user clicks the link in their email
   * @param resetPasswordFlowId - The ID of the reset password flow
   * @param password - The new password
   * @param token - Optional verification token
   */
  async resetPasswordComplete(
    resetPasswordFlowId: string,
    password: string,
    token?: string
  ): Promise<void> {
    const data: UpdateResetPasswordData = {
      password,
      token,
    };
    await this.fetch.put(`reset-password/${resetPasswordFlowId}`, data);
  }

  /**
   * Starts the reset device flow
   * Used when a user has lost access to their 2FA device
   * @param email - The email of the user
   */
  async resetDeviceBegin(email: string): Promise<void> {
    const data: CreateResetDeviceData = {
      email,
      resetUrl: this.options.host + '/auth/reset-device',
      type: RESET_SECURITY_FLOW_TYPE.TOTP,
    };
    await this.fetch.post('reset-device', data);
  }

  /**
   * Completes the reset device flow
   * Used after the user clicks the link in their email
   * @param resetMfaFlowId - The ID of the reset device flow
   * @param password - The user's current password for verification
   */
  async resetDeviceComplete(
    resetMfaFlowId: string,
    password: string
  ): Promise<void> {
    const data: UpdateResetDeviceData = {
      password,
      type: RESET_SECURITY_FLOW_TYPE.TOTP,
    };
    await this.fetch.put(`reset-device/${resetMfaFlowId}`, data);
  }
}
