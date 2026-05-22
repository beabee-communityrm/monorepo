import { Contact } from '#models/index';
import { ContributionInfo, UpdateContributionResult } from '#type/index';

import { PaymentProvider } from './PaymentProvider.js';

/**
 * Implements PaymentProvider for manual payment methods.
 * Provides basic payment operations without external provider integration.
 */
export class ManualProvider extends PaymentProvider {
  /**
   * Checks if the payment flow can be processed. For manual payments this is
   * always true as there are no external constraints.
   * @returns Whether the payment flow can be processed
   */
  async canProcessPaymentFlow(): Promise<boolean> {
    return true;
  }

  /**
   * Process a payment flow. Currently not possible for manual payments
   */
  async processPaymentFlow(): Promise<UpdateContributionResult | undefined> {
    throw new Error('Payment flows are not supported for manual payments');
  }

  /**
   * Checks if contribution updates are allowed. Manual contributions can always
   * be updated as there are no external constraints.
   * @returns Whether contribution updates are allowed
   */
  async canUpdateContribution(): Promise<boolean> {
    return false;
  }

  /**
   * Updates contribution details
   * @param form - New contribution form data
   */
  async processUpdateContribution(): Promise<UpdateContributionResult> {
    throw new Error('Method not implemented.');
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
   * No-op as manual payments don't store external data
   */
  async permanentlyDeleteContact(): Promise<void> {}
}

/** @deprecated Use named import ManualProvider instead */
export default ManualProvider;
