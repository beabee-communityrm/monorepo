import type { PaymentMethod } from '@beabee/beabee-common';

import { getRepository } from '#database';
import type { Contact } from '#models/index';
import { ContactContribution } from '#models/index';
import type {
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
   */
  protected async updateData() {
    await getRepository(ContactContribution).update(this.contact.id, this.data);
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
