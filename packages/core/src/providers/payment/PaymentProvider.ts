import {
  ContributionForm,
  PaymentForm,
  PaymentMethod,
} from '@beabee/beabee-common';

import { getRepository } from '#database';
import { Contact, ContactContribution } from '#models/index';
import {
  CompletedPaymentFlow,
  ContributionInfo,
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
   */
  protected async updateData() {
    await getRepository(ContactContribution).update(this.contact.id, this.data);
  }

  /**
   * Checks if contribution changes are allowed
   * @param useExistingMandate - Whether to use existing payment mandate
   * @param form - New contribution details
   * @returns Promise resolving to boolean indicating if changes are allowed
   */
  abstract canChangeContribution(
    useExistingMandate: boolean,
    form: ContributionForm
  ): Promise<boolean>;

  /**
   * Cancels an active contribution
   * @param keepMandate - Whether to keep payment mandate for future use
   */
  abstract cancelContribution(keepMandate: boolean): Promise<void>;

  /**
   * Gets current contribution information
   * @returns Promise resolving to partial contribution info
   */
  abstract getContributionInfo(): Promise<Partial<ContributionInfo>>;

  /**
   * Updates contact information with payment provider
   * @param updates - Contact fields to update
   */
  abstract updateContact(updates: Partial<Contact>): Promise<void>;

  /**
   * Updates contribution details
   * @param form - New contribution form data
   * @returns Promise resolving to update result
   */
  abstract updateContribution(
    form: ContributionForm
  ): Promise<UpdateContributionResult>;

  /**
   * Updates payment method using completed payment flow
   * @param completedPaymentFlow - The completed payment flow with new method
   */
  abstract updatePaymentMethod(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<void>;

  /**
   * Creates a one-time payment
   * @param form - One-time payment form data
   */
  abstract createOneTimePayment(form: PaymentForm): Promise<void>;

  /**
   * Permanently deletes contact data from payment provider
   */
  abstract permanentlyDeleteContact(): Promise<void>;
}
