import {
  Address,
  ContributionPeriod,
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
import { Contact, JoinFlow, JoinForm, Password } from '#models/index';
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
  PaymentFlow,
  PaymentFlowData,
  PaymentFlowParams,
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
    form: Pick<JoinForm, 'email' | 'password'>,
    urls: CompleteUrls
  ): Promise<void> {
    const joinForm: JoinForm = {
      ...form,
      monthlyAmount: 0, // Currently used below to flag a no contribution join flow
      // TODO: stubbed here, should be optional
      period: ContributionPeriod.Monthly,
      payFee: false,
      prorate: false,
      paymentMethod: PaymentMethod.StripeCard,
    };
    const joinFlow = await getRepository(JoinFlow).save({
      ...urls,
      joinForm,
      paymentFlowId: '',
    });

    await this.sendConfirmationEmail(joinFlow);
  }

  /**
   * Starts a payment registration flow with contribution details
   * @param joinForm - Complete join form with payment details
   * @param urls - Navigation URLs
   * @param completeUrl - Provider-specific completion URL
   * @param user - User data for the flow
   * @returns Promise resolving to payment flow parameters
   */
  async startPaymentRegistration(
    joinForm: JoinForm,
    urls: CompleteUrls,
    completeUrl: string,
    user: { email: string; firstname?: string; lastname?: string }
  ): Promise<PaymentFlowParams> {
    const joinFlow = await getRepository(JoinFlow).save({
      ...urls,
      joinForm,
      paymentFlowId: '',
    });

    log.info('Creating payment registration flow ' + joinFlow.id, { joinForm });

    const paymentFlow = await this.createPaymentFlow(
      joinFlow,
      completeUrl,
      user
    );
    await getRepository(JoinFlow).update(joinFlow.id, {
      paymentFlowId: paymentFlow.id,
    });
    return paymentFlow.params;
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
    data: Partial<JoinForm>
  ): Promise<void> {
    const joinFlow = await getRepository(JoinFlow).findOneBy({ paymentFlowId });
    if (!joinFlow) {
      throw new NotFoundError();
    }

    // Merge additional data into the join form
    if (data.firstname || data.lastname || data.vatNumber) {
      Object.assign(joinFlow.joinForm, data);
      await getRepository(JoinFlow).save(joinFlow);
    }

    await this.sendConfirmationEmail(joinFlow);

    if (!isContributionForm(joinFlow.joinForm)) {
      log.info(
        'Payment join flow is for one-time payment, finalizing immediately ' +
          joinFlow.id
      );
      await this.finalizeRegistration(joinFlow.id, true);
    }
  }

  /**
   * Finalizes a registration flow after email confirmation, creating or updating
   * the contact. For payment flows, also completes payment setup and processes
   * the payment or contribution setup.
   *
   * @param joinFlowId - The ID of the join flow to finalize
   * @returns The created or updated contact
   */
  async finalizeRegistration(
    joinFlowId: string,
    keepFlow: boolean = false
  ): Promise<Contact> {
    const joinFlow = await getRepository(JoinFlow).findOneBy({
      id: joinFlowId,
    });
    if (!joinFlow) {
      throw new NotFoundError();
    }

    let contact = await ContactsService.findOne({
      where: { email: joinFlow.joinForm.email },
      relations: { profile: true },
    });

    const isRecurringForm = isContributionForm(joinFlow.joinForm);

    // If this flow is trying to setup a recurring contribution then check if
    // the contact is already an active member first. This should never really
    // happen as sendConfirmationEmail should have already handled this case by
    // sending a login or set password email instead of a confirm email.
    if (contact?.membership?.isActive && isRecurringForm) {
      throw new DuplicateEmailError();
    }

    const completedPaymentFlow = await this.finalizeAndCleanupFlow(
      joinFlow,
      keepFlow
    );

    // If new contact or they don't have an active membership then update their
    // details, otherwise we leave them alone to avoid overwriting information
    // that is already in use.
    if (!contact?.membership?.isActive) {
      let deliveryAddress: Address | undefined;

      const partialContact = {
        email: joinFlow.joinForm.email,
        password: joinFlow.joinForm.password,
        firstname: joinFlow.joinForm.firstname || '',
        lastname: joinFlow.joinForm.lastname || '',
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
      // If this is a one-off payment join flow, skip the welcome email
      if (!isRecurringForm) {
        return contact;
      }
    }

    await EmailService.sendTemplateToContact('welcome', contact);

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
  ): Promise<PaymentFlowParams> {
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
   * @returns The completed join flow, or undefined if the flow could not be completed
   */
  async finalizeContributionUpdate(
    contact: Contact,
    paymentFlowId: string
  ): Promise<JoinFlow | undefined> {
    const joinFlow = await getRepository(JoinFlow).findOneBy({ paymentFlowId });
    if (joinFlow) {
      const completedFlow = await this.finalizeAndCleanupFlow(joinFlow, false);
      if (completedFlow) {
        await this.executePaymentActions(contact, completedFlow);
        return joinFlow;
      }
    }
  }

  /**
   * Sends the appropriate email for the given join flow. If the email given in
   * the join flow belongs to a contact with an active contribution the user
   * will instead exists in the database the user will instead be given a link
   * to access their account.
   *
   * @param joinFlow The join flow
   */
  private async sendConfirmationEmail(joinFlow: JoinFlow): Promise<void> {
    log.info('Send confirm email for join flow ' + joinFlow.id);

    const contact = await ContactsService.findOneBy({
      email: joinFlow.joinForm.email,
    });

    if (
      contact?.membership?.isActive &&
      isContributionForm(joinFlow.joinForm)
    ) {
      if (contact.password.hash) {
        // Active membership and already has a password set, just send them a login link
        await EmailService.sendTemplateToContact(
          'email-exists-login',
          contact,
          {
            loginLink: joinFlow.loginUrl,
          }
        );
      } else {
        // Active membership but has no password set, give them a link to set a new password
        const rpFlow = await ResetSecurityFlowService.create(
          contact,
          RESET_SECURITY_FLOW_TYPE.PASSWORD
        );
        await EmailService.sendTemplateToContact(
          'email-exists-set-password',
          contact,
          {
            spLink: joinFlow.setPasswordUrl + '/' + rpFlow.id,
          }
        );
      }
    } else {
      // User doesn't exist, their membership is inactive or they are not
      // starting a recurring contribution, ask them to confirm their email
      // address so they can continue the join flow
      await EmailService.sendTemplateTo(
        'confirm-email',
        { email: joinFlow.joinForm.email },
        {
          firstName: joinFlow.joinForm.firstname || '',
          lastName: joinFlow.joinForm.lastname || '',
          confirmLink: joinFlow.confirmUrl + '/' + joinFlow.id,
        }
      );
    }
  }

  /**
   * Finalizes any associated payment flow and cleans up the join flow record.
   * This handles the payment provider interaction and database cleanup.
   *
   * @param joinFlow - The join flow to finalize and clean up
   * @returns Promise resolving to completed payment flow or undefined
   */
  private async finalizeAndCleanupFlow(
    joinFlow: JoinFlow,
    keepFlow: boolean
  ): Promise<CompletedPaymentFlow | undefined> {
    log.info('Completing join flow ' + joinFlow.id);
    const paymentFlow = joinFlow.paymentFlowId
      ? await this.completePaymentFlow(joinFlow)
      : undefined;

    if (keepFlow) {
      await getRepository(JoinFlow).update(joinFlow.id, {
        paymentFlowId: '',
      });
    } else {
      await getRepository(JoinFlow).delete(joinFlow.id);
    }
    return paymentFlow;
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
    const joinForm = completedFlow.joinForm;
    if (isContributionForm(joinForm)) {
      const canChange = await PaymentService.canChangeContribution(
        contact,
        false,
        joinForm
      );

      if (!canChange) {
        throw new CantUpdateContribution();
      }

      await PaymentService.updatePaymentMethod(contact, completedFlow);
      if (joinForm.monthlyAmount > 0) {
        await ContactsService.updateContactContribution(contact, joinForm);
      }
    } else {
      await PaymentService.createOneTimePayment(contact, completedFlow);
      await EmailService.sendTemplateToContact('one-time-donation', contact, {
        amount: joinForm.monthlyAmount,
      });
    }
  }

  /**
   * Create a new payment flow for the given join flow, dispatching to the
   * appropriate provider and returning the created payment flow.
   *
   * @param joinFlow The join flow
   * @param completeUrl The completion URL for the payment flow
   * @param data The payment flow data
   * @returns The created payment flow
   */
  private async createPaymentFlow(
    joinFlow: JoinFlow,
    completeUrl: string,
    data: PaymentFlowData
  ): Promise<PaymentFlow> {
    log.info('Create payment flow for join flow ' + joinFlow.id);
    return paymentProviders[joinFlow.joinForm.paymentMethod].createPaymentFlow(
      joinFlow,
      completeUrl,
      data
    );
  }

  /**
   * Complete the payment flow for the given join flow, dispatching to the
   * appropriate provider and returning the completed payment flow
   *
   * @param joinFlow  The join flow
   * @returns The completed payment flow
   */
  private async completePaymentFlow(
    joinFlow: JoinFlow
  ): Promise<CompletedPaymentFlow> {
    log.info('Complete payment flow for join flow ' + joinFlow.id);
    return paymentProviders[
      joinFlow.joinForm.paymentMethod
    ].completePaymentFlow(joinFlow);
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
      completedPaymentFlow.joinForm.paymentMethod
    ].getCompletedPaymentFlowData(completedPaymentFlow);
  }
}

export const paymentFlowService = new PaymentFlowService();
export default paymentFlowService;
