import {
  Address,
  ContributionPeriod,
  PaymentFlowResult,
  PaymentForm,
  PaymentMethod,
  RESET_SECURITY_FLOW_TYPE,
  isContributionForm,
} from '@beabee/beabee-common';

import { getRepository } from '#database';
import {
  CantUpdateContribution,
  DuplicateEmailError,
  NotFoundError,
} from '#errors/index';
import { log as mainLogger } from '#logging';
import { Contact, Password, PaymentFlow, PaymentFlowForm } from '#models/index';
import {
  gcFlowProvider,
  stripeFlowProvider,
} from '#providers/payment-flow/index';
import ContactsService from '#services/ContactsService';
import EmailService from '#services/EmailService';
import OptionsService from '#services/OptionsService';
import PaymentService from '#services/PaymentService';
import {
  CompleteUrls,
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlowData,
  PaymentFlowSetup,
} from '#type/index';

import ResetSecurityFlowService from './ResetSecurityFlowService';

const paymentProviders = {
  [PaymentMethod.StripeCard]: stripeFlowProvider,
  [PaymentMethod.StripeSEPA]: stripeFlowProvider,
  [PaymentMethod.StripeBACS]: stripeFlowProvider,
  [PaymentMethod.StripePayPal]: stripeFlowProvider,
  [PaymentMethod.StripeIdeal]: stripeFlowProvider,
  [PaymentMethod.GoCardlessDirectDebit]: gcFlowProvider,
};

const log = mainLogger.child({ app: 'payment-flow-service' });

/**
 * Service that manages the complete payment flow process in beabee.
 * Coordinates between different payment providers and handles the setup of new payment methods.
 *
 * The flow typically consists of these steps:
 * 1. Join flow creation
 * 2. Provider-specific setup (Stripe/GoCardless)
 * 3. Payment completion
 * 4. Contact and subscription setup
 */
class PaymentFlowService {
  /**
   * Starts a simple registration flow without payment, sending a confirmation email
   * @param form - Basic user information (email and password)
   * @param urls - URLs for completion and cancellation handling
   * @returns Promise that resolves when the flow is started
   */
  async startSimpleRegistration(
    form: Pick<PaymentFlowForm, 'email' | 'password'>,
    urls: CompleteUrls
  ): Promise<void> {
    const formData: PaymentFlowForm = {
      ...form,
      monthlyAmount: 0, // Currently used below to flag a no contribution join flow
      // TODO: stubbed here, should be optional
      period: ContributionPeriod.Monthly,
      payFee: false,
      prorate: false,
      paymentMethod: PaymentMethod.StripeCard,
    };
    const flow = await getRepository(PaymentFlow).save({
      ...urls,
      form: formData,
      paymentFlowId: '',
    });

    await this.sendConfirmationEmail(flow);
  }

  /**
   * Starts a payment registration flow with contribution details
   * @param form - Complete payment flow form with payment details
   * @param urls - Navigation URLs
   * @param completeUrl - Provider-specific completion URL
   * @param user - User data for the flow
   * @returns Promise resolving to payment flow parameters
   */
  async startPaymentRegistration(
    form: PaymentFlowForm,
    urls: CompleteUrls,
    completeUrl: string,
    user: { email: string; firstname?: string; lastname?: string }
  ): Promise<PaymentFlowResult> {
    const flow = await getRepository(PaymentFlow).save({
      ...urls,
      form,
      paymentFlowId: '',
    });

    log.info('Creating payment registration flow ' + flow.id, { form });

    const paymentFlowParams = await this.setupPaymentFlow(
      flow,
      completeUrl,
      user
    );
    await getRepository(PaymentFlow).update(flow.id, {
      paymentFlowId: paymentFlowParams.id,
    });
    return paymentFlowParams.result;
  }

  /**
   * Advances a payment registration after payment provider setup is complete.
   * Merges additional user data and sends confirmation email. For one-time payments,
   * immediately finalizes the registration.
   * @param paymentFlowId - ID of the payment flow to advance
   * @param data - Additional user data from the payment provider
   */
  async advancePaymentRegistration(
    paymentFlowId: string,
    data: Partial<PaymentFlowForm>
  ): Promise<void> {
    const flow = await getRepository(PaymentFlow).findOneBy({
      paymentFlowId,
    });
    if (!flow) {
      throw new NotFoundError();
    }

    // Merge additional data into the form
    if (data.firstname || data.lastname || data.vatNumber) {
      Object.assign(flow.form, data);
      await getRepository(PaymentFlow).save(flow);
    }

    if (!isContributionForm(flow.form)) {
      log.info(
        'Payment flow is for one-time payment, finalizing immediately ' +
          flow.id
      );
      await this.finalizeRegistration(flow.id, true);
    }

    await this.sendConfirmationEmail(flow);
  }

  /**
   * Finalizes a registration flow after email confirmation, creating or updating
   * the contact. For payment flows, also completes payment setup and processes
   * the payment or contribution setup.
   *
   * @param paymentFlowId - The ID of the payment flow to finalize
   * @param keepFlow - Whether to keep the payment flow record after finalization
   * @returns The created or updated contact
   */
  async finalizeRegistration(
    paymentFlowId: string,
    keepFlow: boolean = false
  ): Promise<Contact | undefined> {
    const flow = await getRepository(PaymentFlow).findOne({
      where: { id: paymentFlowId },
      relations: { contact: true },
    });
    if (!flow) {
      throw new NotFoundError();
    }

    if (flow.contact) {
      if (!keepFlow) {
        await getRepository(PaymentFlow).delete(flow.id);
      }

      return flow.contact;
    }

    // Use atomic update to prevent multiple simultaneous attempts to finalize
    // the same flow
    const res = await getRepository(PaymentFlow).update(
      { id: flow.id, processing: false },
      { processing: true }
    );
    if (res.affected === 0) {
      return;
    }

    let contact = await ContactsService.findOne({
      where: { email: flow.form.email },
      relations: { profile: true },
    });

    const isRecurringForm = isContributionForm(flow.form);

    // If this flow is trying to setup a recurring contribution then check if
    // the contact is already an active member first. This should never really
    // happen as sendConfirmationEmail should have already handled this case by
    // sending a login or set password email instead of a confirm email.
    if (contact?.membership?.isActive && isRecurringForm) {
      throw new DuplicateEmailError();
    }

    const completedPaymentFlow = await this.completePaymentFlow(flow);

    // If new contact or they don't have an active membership then update their
    // details, otherwise we leave them alone to avoid overwriting information
    // that is already in use.
    if (!contact?.membership?.isActive) {
      let deliveryAddress: Address | undefined;

      const partialContact = {
        email: flow.form.email,
        password: flow.form.password,
        firstname: flow.form.firstname || '',
        lastname: flow.form.lastname || '',
      };

      // Prefill contact data from payment provider if possible
      if (completedPaymentFlow) {
        const paymentData =
          await this.getCompletedPaymentFlowData(completedPaymentFlow);

        partialContact.firstname ||= paymentData.firstname || '';
        partialContact.lastname ||= paymentData.lastname || '';
        deliveryAddress = OptionsService.getBool('show-mail-opt-in')
          ? paymentData.billingAddress
          : undefined;
      }

      if (contact) {
        await ContactsService.updateContact(contact, partialContact);
      } else {
        contact = await ContactsService.createContact(partialContact, {
          newsletterStatus: OptionsService.getText('newsletter-default-status'),
          deliveryAddress: deliveryAddress || null,
        });
      }
    }

    if (completedPaymentFlow) {
      await this.executePaymentActions(contact, completedPaymentFlow);
    }

    if (keepFlow) {
      await getRepository(PaymentFlow).update(flow.id, {
        contactId: contact.id,
      });
    } else {
      await getRepository(PaymentFlow).delete(flow.id);
    }

    // If this is a one-off payment join flow, skip the welcome email
    if (!completedPaymentFlow || isRecurringForm) {
      await EmailService.sendTemplateToContact('welcome', contact);
    }

    return contact;
  }

  /**
   * Starts a contribution update flow for existing contacts to change their
   * payment method and/or contribution details (amount, period, etc.).
   *
   * @param contact - The contact updating their contribution
   * @param paymentMethod - The new payment method to use
   * @param completeUrl - URL to redirect to after payment setup
   * @param form - Optional form data for contribution changes
   * @returns The payment flow parameters
   */
  async startContributionUpdate(
    contact: Contact,
    paymentMethod: PaymentMethod,
    completeUrl: string,
    form?: PaymentForm
  ): Promise<PaymentFlowResult> {
    // TODO: if it's just a payment method update then these should be optional
    if (!form) {
      form = {
        monthlyAmount: 0, // Stub to indicate no contribution update
        period: ContributionPeriod.Monthly,
        payFee: false,
        prorate: false,
      };
    }

    if (
      isContributionForm(form) &&
      !(await PaymentService.canChangeContribution(contact, false, form))
    ) {
      throw new CantUpdateContribution();
    }

    // TODO: rework this to not reuse startPaymentRegistration so that we don't
    // have to stub so many fielsd
    return await this.startPaymentRegistration(
      {
        paymentMethod,
        ...form,
        password: Password.none,
        email: contact.email,
      },
      { confirmUrl: '', loginUrl: '', setPasswordUrl: '' },
      completeUrl,
      contact
    );
  }

  /**
   * Finalizes a contribution update flow after payment provider confirms the
   * new payment method is set up, updating the contact's payment details.
   *
   * @param contact - The contact whose contribution is being updated
   * @param paymentFlowId - The ID of the payment flow to finalize
   * @returns True if the contribution update was finalized, false otherwise
   */
  async finalizeContributionUpdate(
    contact: Contact,
    paymentFlowId: string
  ): Promise<boolean> {
    const flow = await getRepository(PaymentFlow).findOneBy({
      paymentFlowId,
    });
    if (flow) {
      // Use atomic update to prevent multiple simultaneous attempts to finalize
      // the same flow
      const res = await getRepository(PaymentFlow).update(
        { id: flow.id, processing: false },
        { processing: true }
      );
      if (res.affected === 0) {
        return true;
      }

      const completedFlow = await this.completePaymentFlow(flow);
      if (completedFlow) {
        await this.executePaymentActions(contact, completedFlow);
        await getRepository(PaymentFlow).delete(flow.id);
        return true;
      }
    }

    return false;
  }

  /**
   * Permanently deletes all payment flows associated with a contact
   *
   * @param contact The contact
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    // Delete any payment flows associated with this contact
    await getRepository(PaymentFlow).delete({ contactId: contact.id });
  }

  /**
   * Sends the appropriate email for the given join flow based on the contact's
   * status and the type of contribution they are setting up.
   *
   * Email logic:
   * - One-time contributions:
   *   - Contact with password set: sends login email
   *   - No contact or no password: sends setup account email
   * - Recurring contributions:
   *   - Contact with active membership: sends login email
   *   - Contact with active membership but no password: sends set password email
   *   - No contact or inactive membership: confirm email
   *
   * @param flow The payment flow
   */
  private async sendConfirmationEmail(flow: PaymentFlow): Promise<void> {
    log.info('Send confirm email for payment flow ' + flow.id);

    const contact = await ContactsService.findOneBy({
      email: flow.form.email,
    });

    const isRecurring = isContributionForm(flow.form);

    if (
      // Contact already exists with an active contribution
      contact?.membership?.isActive ||
      // One-time contribution and their account was previously setup
      (!isRecurring && contact?.password.hash)
    ) {
      if (contact.password.hash) {
        await EmailService.sendTemplateToContact(
          'email-exists-login',
          contact,
          {
            loginLink: flow.loginUrl,
          }
        );
      } else {
        const rpFlow = await ResetSecurityFlowService.create(
          contact,
          RESET_SECURITY_FLOW_TYPE.PASSWORD
        );
        await EmailService.sendTemplateToContact(
          'email-exists-set-password',
          contact,
          {
            spLink: flow.setPasswordUrl + '/' + rpFlow.id,
          }
        );
      }
    } else {
      // User doesn't exist, their membership is inactive or they are not
      // starting a recurring contribution, ask them to confirm their email
      // address so they can continue the join flow
      await EmailService.sendTemplateTo(
        isRecurring ? 'confirm-email' : 'setup-account',
        { email: flow.form.email },
        {
          firstName: flow.form.firstname || '',
          lastName: flow.form.lastname || '',
          confirmLink: flow.confirmUrl + '/' + flow.id,
        }
      );
    }
  }

  /**
   * Executes the actual payment actions after a payment flow is completed.
   * For recurring contributions: updates payment method and contribution details.
   * For one-time payments: processes the payment and sends confirmation.
   *
   * @param contact - The contact receiving the payment actions
   * @param completedFlow - The completed payment flow data
   */
  private async executePaymentActions(
    contact: Contact,
    completedFlow: CompletedPaymentFlow
  ): Promise<void> {
    const form = completedFlow.form;
    if (isContributionForm(form)) {
      const canChange = await PaymentService.canChangeContribution(
        contact,
        false,
        form
      );

      if (!canChange) {
        throw new CantUpdateContribution();
      }

      await PaymentService.updatePaymentMethod(contact, completedFlow);
      if (form.monthlyAmount > 0) {
        await ContactsService.updateContactContribution(contact, form);
      }
    } else {
      await PaymentService.createOneTimePayment(contact, completedFlow);
    }
  }

  /**
   * Create a new payment flow for the given payment flow, dispatching to the
   * appropriate provider and returning the created payment flow.
   *
   * @param flow The payment flow
   * @param completeUrl The completion URL for the payment flow
   * @param data The payment flow data
   * @returns The created payment flow
   */
  private async setupPaymentFlow(
    flow: PaymentFlow,
    completeUrl: string,
    data: PaymentFlowData
  ): Promise<PaymentFlowSetup> {
    log.info('Create payment flow for payment flow ' + flow.id);
    return paymentProviders[
      flow.form.paymentMethod as PaymentMethod
    ].setupPaymentFlow(flow, completeUrl, data);
  }

  /**
   * Complete the payment flow for the given payment flow, dispatching to the
   * appropriate provider and returning the completed payment flow
   *
   * @param flow  The payment flow
   * @returns The completed payment flow
   */
  private async completePaymentFlow(
    flow: PaymentFlow
  ): Promise<CompletedPaymentFlow | undefined> {
    if (flow.paymentFlowId) {
      log.info('Complete payment flow for payment flow ' + flow.id);
      return paymentProviders[
        flow.form.paymentMethod as PaymentMethod
      ].completePaymentFlow(flow);
    } else {
      return undefined;
    }
  }

  /**
   * Fetch data from the provider for the completed payment flow. This is used
   * to fetch additional information filled in by the user such as billing
   * address or name.
   *
   * @param completedPaymentFlow  The completed payment flow
   * @returns The completed payment flow data
   */
  private async getCompletedPaymentFlowData(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<CompletedPaymentFlowData> {
    return paymentProviders[
      completedPaymentFlow.form.paymentMethod
    ].getCompletedPaymentFlowData(completedPaymentFlow);
  }
}

export const paymentFlowService = new PaymentFlowService();
export default paymentFlowService;
