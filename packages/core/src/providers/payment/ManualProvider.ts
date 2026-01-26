import { ContributionForm, PaymentForm } from '@beabee/beabee-common';

import { Contact } from '#models/index';
import {
  CompletedPaymentFlow,
  ContributionInfo,
  UpdateContributionResult,
} from '#type/index';

import { PaymentProvider } from './PaymentProvider';

/**
 * Implements PaymentProvider for manual payment methods.
 * Provides basic payment operations without external provider integration.
 */
export class ManualProvider extends PaymentProvider {
  /**
   * Checks if contribution changes are allowed
   * @param useExistingMandate - Whether to use existing mandate
   * @returns Promise resolving to true as manual payments can always be changed
   */
  async canChangeContribution(useExistingMandate: boolean): Promise<boolean> {
    return !useExistingMandate;
  }

  /**
   * Gets current contribution information
   * @returns Promise resolving to partial contribution info with basic payment source data
   */
  async getContributionInfo(): Promise<Partial<ContributionInfo>> {
    return {
      paymentSource: {
        method: null,
        ...(this.data.customerId && {
          reference: this.data.customerId,
        }),
        ...(this.data.mandateId && {
          source: this.data.mandateId,
        }),
      },
    };
  }

  /**
   * Cancels contribution by updating local data
   * @param keepMandate - Whether to keep mandate (unused in manual payments)
   */
  async cancelContribution(keepMandate: boolean): Promise<void> {}

  /**
   * No-op as manual payments don't have external contact data
   * @param updates - Contact fields to update
   */
  async updateContact(updates: Partial<Contact>): Promise<void> {}

  /**
   * Updates contribution details
   * @param form - New contribution form data
   */
  async updateContribution(
    form: ContributionForm
  ): Promise<UpdateContributionResult> {
    throw new Error('Method not implemented.');
  }

  /**
   * No-op as manual payments don't use payment methods
   * @param completedPaymentFlow - The completed payment flow
   */
  async updatePaymentMethod(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  /**
   * No-op as manual payments don't support one-time payments
   */
  async createOneTimePayment(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * No-op as manual payments don't store external data
   */
  async permanentlyDeleteContact(): Promise<void> {}
}

/** @deprecated Use named import ManualProvider instead */
export default ManualProvider;
