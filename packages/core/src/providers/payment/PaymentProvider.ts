import { PaymentMethod } from '@beabee/beabee-common';

import { getRepository } from '#database';
import { Contact, ContactContribution } from '#models/index';
import {
  CompletedPaymentFlow,
  ContributionInfo,
  PaymentFlowForm,
  UpdateContributionForm,
  UpdateContributionResult,
} from '#type/index';

/**
 * Abstract base class for payment providers that handle ongoing payment operations.
 * Implemented by specific providers (Stripe, GoCardless) to manage contributions.
 */
export abstract class PaymentProvider {
  protected readonly data: ContactContribution;
  protected readonly contact: Contact;
  protected readonly method: PaymentMethod;

  constructor(data: ContactContribution) {
    this.data = data;
    this.contact = data.contact;
    this.method = data.method as PaymentMethod;
  }

  /**
   * Updates the contribution data in the database
   * @deprecated Use withDataUpdate() instead for automatic error handling and state persistence
   */
  protected async updateData() {
    await getRepository(ContactContribution).update(this.contact.id, this.data);
  }

  /**
   * Execute an operation that modifies contact data, ensuring updates are persisted.
   * Provides a safety net to save state even if the operation fails.
   *
   * @param operation The async operation to execute
   * @returns The result of the operation
   */
  protected async withDataUpdate<T>(operation: () => Promise<T>): Promise<T> {
    try {
      const result = await operation();
      await this.updateData();
      return result;
    } catch (error) {
      // Try to persist any changes made before the error
      try {
        await this.updateData();
      } catch (updateError) {
        // Log the update failure but preserve the original error
        console.error('Failed to update data after error', updateError);
      }
      throw error;
    }
  }

  /**
   * Can the provider process the given payment flow at the moment. This can be used by
   * payment providers to block certain flows when the user is in a state where they can't
   * be processed.
   * @param form - The payment flow to be processed
   * @returns Whether the payment flow can be processed
   */
  abstract canProcessPaymentFlow(form: PaymentFlowForm): Promise<boolean>;

  /**
   * Process the payment flow and perform the necessary operations to complete it.
   * @param form - The payment flow to be processed
   */
  abstract processPaymentFlow(
    form: CompletedPaymentFlow
  ): Promise<UpdateContributionResult | undefined>;

  /**
   * Checks if contribution updates are allowed. This can be used to block
   * contribution updates when the user is in a state where they can't be
   * processed (e.g. pending payments with GoCardless).
   * @param form - New contribution details
   * @returns Whether contribution updates are allowed
   */
  abstract canUpdateContribution(
    form: UpdateContributionForm
  ): Promise<boolean>;

  /**
   * Updates contribution details
   * @param form - New contribution form data
   * @returns Promise resolving to update result
   */
  abstract processUpdateContribution(
    form: UpdateContributionForm
  ): Promise<UpdateContributionResult>;

  /**
   * Gets current contribution information
   * @returns Promise resolving to partial contribution info
   */
  abstract getContributionInfo(): Promise<Partial<ContributionInfo>>;

  /**
   * Cancels an active contribution
   * @param keepMandate - Whether to keep payment mandate for future use
   */
  abstract cancelContribution(keepMandate: boolean): Promise<void>;

  /**
   * Updates contact information with payment provider
   * @param updates - Contact fields to update
   */
  abstract updateContact(updates: Partial<Contact>): Promise<void>;

  /**
   * Permanently deletes contact data from payment provider
   */
  abstract permanentlyDeleteContact(): Promise<void>;
}
