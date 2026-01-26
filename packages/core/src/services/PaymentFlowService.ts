import {
  Address,
  ContributionPeriod,
  PaymentForm,
  PaymentMethod,
  RESET_SECURITY_FLOW_TYPE,
  isContributionForm,
} from '@beabee/beabee-common';

import { getRepository } from '#database';
import { CantUpdateContribution, DuplicateEmailError } from '#errors/index';
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
   * Creates a new join flow for user registration without any payment
   * @param form - Basic user information (email and password)
   * @param urls - URLs for completion and cancellation handling
   * @returns Promise resolving to created JoinFlow
   */
  async createSimpleJoinFlow(
    form: Pick<JoinForm, 'email' | 'password'>,
    urls: CompleteUrls
  ): Promise<JoinFlow> {
    const joinForm: JoinForm = {
      ...form,
      monthlyAmount: 0, // Currently used below to flag a no contribution join flow
      // TODO: stubbed here, should be optional
      period: ContributionPeriod.Monthly,
      payFee: false,
      prorate: false,
      paymentMethod: PaymentMethod.StripeCard,
    };
    return await getRepository(JoinFlow).save({
      ...urls,
      joinForm,
      paymentFlowId: '',
    });
  }

  /**
   * Creates a payment join flow with contribution details
   * @param joinForm - Complete join form with payment details
   * @param urls - Navigation URLs
   * @param completeUrl - Provider-specific completion URL
   * @param user - User data for the flow
   * @returns Promise resolving to payment flow parameters
   */
  async createPaymentJoinFlow(
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

    log.info('Creating payment join flow ' + joinFlow.id, { joinForm });

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
   * Retrieves a join flow by its associated payment flow ID
   *
   * @param paymentFlowId The payment flow ID
   * @returns The join flow or null if not found
   */
  async getJoinFlowByPaymentId(
    paymentFlowId: string
  ): Promise<JoinFlow | null> {
    return await getRepository(JoinFlow).findOneBy({ paymentFlowId });
  }

  /**
   * Completes a join flow after provider setup and deletes it. If there is an
   * associated payment flow it will also be completed and returned
   *
   * @param joinFlow - The join flow to complete
   * @returns Promise resolving to completed payment flow or undefined.
   */
  private async completeJoinFlow(
    joinFlow: JoinFlow
  ): Promise<CompletedPaymentFlow | undefined> {
    log.info('Completing join flow ' + joinFlow.id);
    const paymentFlow = joinFlow.paymentFlowId
      ? await this.completePaymentFlow(joinFlow)
      : undefined;
    await getRepository(JoinFlow).delete(joinFlow.id);
    return paymentFlow;
  }

  /**
   * Sends the appropriate email for the given join flow. If the email given in
   * the join flow belongs to a contact with an active contribution the user
   * will instead exists in the database the user will instead be given a link
   * to access their account.
   *
   * @param joinFlow The join flow
   */
  async sendConfirmEmail(joinFlow: JoinFlow): Promise<void> {
    log.info('Send confirm email for join flow ' + joinFlow.id);

    const contact = await ContactsService.findOneBy({
      email: joinFlow.joinForm.email,
    });

    if (contact?.membership?.isActive) {
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
      // User doesn't exist or their membership is inactive, ask them to confirm
      // their email address so they can continue the join flow
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
   * Completes the confirm email step of the join flow, creating or updating
   * the contact based on the join flow data. If there is an associated
   * payment flow it will also be completed and the contact's payment method set
   * appropriately.
   *
   * @param joinFlow The join flow to complete the confirm email for
   * @returns The created or updated contact
   */
  async completeConfirmEmail(joinFlow: JoinFlow): Promise<Contact> {
    // Check for an existing active member first to avoid completing the join
    // flow unnecessarily. This should never really happen as the user won't
    // get a confirm email if they are already an active member
    let contact = await ContactsService.findOne({
      where: { email: joinFlow.joinForm.email },
      relations: { profile: true },
    });
    if (contact?.membership?.isActive) {
      throw new DuplicateEmailError();
    }

    const partialContact = {
      email: joinFlow.joinForm.email,
      password: joinFlow.joinForm.password,
      firstname: joinFlow.joinForm.firstname || '',
      lastname: joinFlow.joinForm.lastname || '',
    };

    const completedPaymentFlow = await this.completeJoinFlow(joinFlow);
    let deliveryAddress: Address | undefined;

    if (completedPaymentFlow) {
      const paymentData =
        await this.getCompletedPaymentFlowData(completedPaymentFlow);

      // Prefill contact data from payment provider if possible
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

    if (completedPaymentFlow) {
      await this.processCompletedFlow(contact, completedPaymentFlow);
      // If this is a one-off payment join flow, skip the welcome email
      if (!isContributionForm(joinFlow.joinForm)) {
        return contact;
      }
    }

    await EmailService.sendTemplateToContact('welcome', contact);

    return contact;
  }

  /**
   * Create a new payment update flow. This is used to take the user through
   * setting or updating their payment method. If contribution amount, period,
   * etc. are provided then this flow will also be used to update a user's
   * contribution after the new payment method is set.
   *
   * @param contact The contact updating their payment method
   * @param form Optional payment form
   * @returns The payment flow parameters
   */
  async createPaymentUpdateFlow(
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

    // TODO: rework this to not reuse createPaymentJoinFlow so that we don't
    // have to stub so many fielsd
    return await this.createPaymentJoinFlow(
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
   * Completes a payment update flow, updating the contact's payment method.
   *
   * @param contact The contact updating their payment method
   * @param paymentFlowId The ID of the payment flow to complete
   * @returns The completed join flow, or undefined if the flow could not be completed
   */
  async completePaymentUpdateFlow(
    contact: Contact,
    paymentFlowId: string
  ): Promise<JoinFlow | undefined> {
    const joinFlow = await this.getJoinFlowByPaymentId(paymentFlowId);
    if (joinFlow) {
      const completedFlow = await this.completeJoinFlow(joinFlow);
      if (completedFlow) {
        await this.processCompletedFlow(contact, completedFlow);
        return joinFlow;
      }
    }
  }

  /**
   * Process the completed payment flow. For contribution flows this will update
   * the payment method and either update or create a contribution. For one-time
   * payment flows it will create a one-time payment.
   *
   * @param contact The contact
   * @param completedFlow The completed payment flow
   */
  private async processCompletedFlow(
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
