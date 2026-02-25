import {
  Address,
  ContributionPeriod,
  PaymentFlowParams,
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
 * 1. Payment flow creation
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
    formData: Pick<PaymentFlowForm, 'email' | 'password'>,
    urls: CompleteUrls
  ): Promise<void> {
    const form: PaymentFlowForm = {
      ...formData,
      monthlyAmount: 0, // Currently used below to flag a no contribution flow
      // TODO: stubbed here, should be optional
      period: ContributionPeriod.Monthly,
      payFee: false,
      prorate: false,
    };

    const flow = await getRepository(PaymentFlow).save({
      ...urls,
      form,
      paymentFlowId: '',
      // params here
    });

    await this.sendConfirmationEmail(flow);
  }

  /**
   * Starts a payment registration flow with contribution details
   * @param form - Complete payment form with payment details
   * @param urls - Navigation URLs
   * @param paymentFlowParams - Parameters for the payment flow
   * @returns The payment flow result for the client
   */
  async startPaymentRegistration(
    form: PaymentFlowForm,
    urls: CompleteUrls,
    params: PaymentFlowParams
  ): Promise<PaymentFlowResult> {
    const flow = await getRepository(PaymentFlow).save({
      ...urls,
      form,
      paymentFlowId: '',
      params,
    });

    log.info('Creating payment registration flow ' + flow.id, { form });

    const paymentFlow = await this.setupPaymentFlow(flow);
    await getRepository(PaymentFlow).update(flow.id, {
      paymentFlowId: paymentFlow.id,
    });
    return paymentFlow.result;
  }

  /**
   * Advances a payment registration after payment provider setup is complete.
   * Sends confirmation email, and for one-time payments, immediately finalizes
   * the registration.
   * @param paymentFlowId - ID of the payment flow to advance
   */
  async advancePaymentRegistration(paymentFlowId: string): Promise<void> {
    const flow = await getRepository(PaymentFlow).findOneBy({
      paymentFlowId,
    });
    if (!flow) {
      throw new NotFoundError();
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
   * @param flowId - The ID of the payment flow to finalize
   * @param keepFlow - Whether to keep the flow record after finalization
   * @returns The created or updated contact
   */
  async finalizeRegistration(
    flowId: string,
    keepFlow: boolean = false
  ): Promise<Contact> {
    const flow = await getRepository(PaymentFlow).findOne({
      where: { id: flowId },
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

      const partialContact: Partial<Contact> & { email: string } = {
        email: flow.form.email,
        password: flow.form.password,
      };

      // Prefill contact data from payment provider if possible
      if (completedPaymentFlow) {
        const flowData =
          await this.getCompletedPaymentFlowData(completedPaymentFlow);

        partialContact.firstname = flowData.firstname;
        partialContact.lastname = flowData.lastname;
        deliveryAddress = OptionsService.getBool('show-mail-opt-in')
          ? flowData.billingAddress
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

    // If this is a one-off payment flow, skip the welcome email
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
   * @returns The payment flow result
   */
  async startContributionUpdate(
    contact: Contact,
    params: PaymentFlowParams,
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
        ...form,
        password: Password.none,
        email: contact.email,
      },
      { confirmUrl: '', loginUrl: '', setPasswordUrl: '' },
      params
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
   * Sends the appropriate email for the given payment flow based on the contact's
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
      // address so they can continue the payment flow
      await EmailService.sendTemplateTo(
        isRecurring ? 'confirm-email' : 'setup-account',
        { email: flow.form.email },
        {
          firstName: '', // TODO: flow.form.firstname || '',
          lastName: '', // TODO: flow.form.lastname || '',
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
  private async setupPaymentFlow(flow: PaymentFlow): Promise<PaymentFlowSetup> {
    log.info('Create payment flow for payment flow ' + flow.id);
    return paymentProviders[flow.params.paymentMethod].setupPaymentFlow(
      flow as any
    ); // TODO
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
      return paymentProviders[flow.params.paymentMethod].completePaymentFlow(
        flow as any
      ); // TODO
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
      completedPaymentFlow.params.paymentMethod
    ].getCompletedPaymentFlowData(completedPaymentFlow as any); // TODO
  }
}

export const paymentFlowService = new PaymentFlowService();
export default paymentFlowService;
