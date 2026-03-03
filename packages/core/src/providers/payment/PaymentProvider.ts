import { PaymentFlowParams, PaymentMethod } from '@beabee/beabee-common';

import { getRepository } from '#database';
import { Contact, ContactContribution } from '#models/index';
import {
  CompletedPaymentFlow,
  ContributionInfo,
  PaymentFlowForm,
  PaymentFlowFormCreateOneTimePayment,
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
   */
  protected async updateData() {
    await getRepository(ContactContribution).update(this.contact.id, this.data);
  }

  abstract canProcessPaymentFlow(form: PaymentFlowForm): Promise<boolean>;

  /**
   * Checks if contribution changes are allowed
   * @param form - New contribution details
   * @returns Promise resolving to boolean indicating if changes are allowed
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
   * Process a payment flow
   */
  abstract processPaymentFlow(
    flow: CompletedPaymentFlow
  ): Promise<UpdateContributionResult | undefined>;

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
   * Permanently deletes contact data from payment provider
   */
  abstract permanentlyDeleteContact(): Promise<void>;
}
