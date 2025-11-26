import {
  type ContributionInfo,
  ContributionPeriod,
  type ForceUpdateContributionData,
  type PaymentFlowParams,
  type Serial,
  type SetContributionData,
  type StartContributionData,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing contribution operations
 */
export class ContactContributionClient extends BaseClient {
  completeUrl: string;

  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/contact'),
    });
    this.completeUrl = options.host + '/profile/contribution/complete';
  }

  /**
   * Deserialize a contribution
   */
  static deserialize(data: Serial<ContributionInfo>): ContributionInfo {
    return {
      ...data,
      cancellationDate: this.deserializeDate(data.cancellationDate),
      membershipExpiryDate: this.deserializeDate(data.membershipExpiryDate),
      renewalDate: this.deserializeDate(data.renewalDate),
    };
  }

  /**
   * Get the current user's contribution information
   */
  async get(): Promise<ContributionInfo> {
    const { data } =
      await this.fetch.get<Serial<ContributionInfo>>('/me/contribution');
    return ContactContributionClient.deserialize(data);
  }

  /**
   * Update the current user's contribution
   */
  async update(updateData: SetContributionData): Promise<ContributionInfo> {
    const { data } = await this.fetch.patch<Serial<ContributionInfo>>(
      '/me/contribution',
      {
        amount: updateData.amount,
        period: updateData.period,
        payFee:
          updateData.payFee && updateData.period === ContributionPeriod.Monthly,
        prorate:
          updateData.prorate &&
          updateData.period === ContributionPeriod.Annually,
      }
    );
    return ContactContributionClient.deserialize(data);
  }

  /**
   * Force update a contribution for a specific contact
   */
  async forceUpdate(
    id: string,
    updateData: ForceUpdateContributionData
  ): Promise<ContributionInfo> {
    const { data } = await this.fetch.patch(
      `/${id}/contribution/force`,
      updateData
    );
    return ContactContributionClient.deserialize(data);
  }

  /**
   * Start a new contribution
   */
  async start(startData: StartContributionData): Promise<PaymentFlowParams> {
    const { data } = await this.fetch.post<Serial<PaymentFlowParams>>(
      '/me/contribution',
      startData
    );
    return data;
  }

  /**
   * Complete starting a contribution
   */
  async completeStart(paymentFlowId: string): Promise<ContributionInfo> {
    const { data } = await this.fetch.post<Serial<ContributionInfo>>(
      '/me/contribution/complete',
      {
        paymentFlowId,
      }
    );
    return ContactContributionClient.deserialize(data);
  }

  /**
   * Cancel a contribution
   */
  async cancel(id: string): Promise<void> {
    await this.fetch.post(`/${id}/contribution/cancel`);
  }
}
