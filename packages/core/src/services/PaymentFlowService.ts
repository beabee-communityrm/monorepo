import {
  Address,
  ContributionPeriod,
  PaymentMethod,
  RESET_SECURITY_FLOW_TYPE,
} from '@beabee/beabee-common';

import { getRepository } from '#database';
import { DuplicateEmailError } from '#errors/index';
import { log as mainLogger } from '#logging';
import { Contact, JoinFlow, JoinForm } from '#models/index';
import {
  PaymentFlowProvider,
  gcFlowProvider,
  stripeFlowProvider,
} from '#providers';
import ContactsService from '#services/ContactsService';
import { emailService } from '#services/EmailService';
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
class PaymentFlowService implements PaymentFlowProvider {
  /**
   * Creates a new join flow for user registration
   * @param form - Basic user information (email and password)
   * @param urls - URLs for completion and cancellation handling
   * @returns Promise resolving to created JoinFlow
   */
  async createJoinFlow(
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

  async getJoinFlowByPaymentId(
    paymentFlowId: string
  ): Promise<JoinFlow | null> {
    return await getRepository(JoinFlow).findOneBy({ paymentFlowId });
  }

  /**
   * Completes a join flow after provider setup
   * @param joinFlow - The join flow to complete
   * @returns Promise resolving to completed payment flow or undefined
   */
  async completeJoinFlow(
    joinFlow: JoinFlow
  ): Promise<CompletedPaymentFlow | undefined> {
    log.info('Completing join flow ' + joinFlow.id);
    const paymentFlow = joinFlow.paymentFlowId
      ? await this.completePaymentFlow(joinFlow)
      : undefined;
    await getRepository(JoinFlow).delete(joinFlow.id);
    return paymentFlow;
  }

  async sendConfirmEmail(joinFlow: JoinFlow): Promise<void> {
    log.info('Send confirm email for join flow ' + joinFlow.id);

    const contact = await ContactsService.findOneBy({
      email: joinFlow.joinForm.email,
    });

    if (contact?.membership?.isActive) {
      if (contact.password.hash) {
        await emailService.sendTemplate('email-exists-login', {
          contact,
          loginLink: joinFlow.loginUrl,
        });
      } else {
        const rpFlow = await ResetSecurityFlowService.create(
          contact,
          RESET_SECURITY_FLOW_TYPE.PASSWORD
        );
        await emailService.sendTemplate('email-exists-set-password', {
          contact,
          spLink: joinFlow.setPasswordUrl + '/' + rpFlow.id,
        });
      }
    } else {
      await emailService.sendTemplateTo(
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
      await PaymentService.updatePaymentMethod(contact, completedPaymentFlow);
      await ContactsService.updateContactContribution(
        contact,
        joinFlow.joinForm
      );
    }

    await emailService.sendTemplate('welcome', { contact });

    return contact;
  }

  async createPaymentFlow(
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

  async completePaymentFlow(joinFlow: JoinFlow): Promise<CompletedPaymentFlow> {
    log.info('Complete payment flow for join flow ' + joinFlow.id);
    return paymentProviders[
      joinFlow.joinForm.paymentMethod
    ].completePaymentFlow(joinFlow);
  }

  async getCompletedPaymentFlowData(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<CompletedPaymentFlowData> {
    return paymentProviders[
      completedPaymentFlow.joinForm.paymentMethod
    ].getCompletedPaymentFlowData(completedPaymentFlow);
  }
}

export const paymentFlowService = new PaymentFlowService();
export default paymentFlowService;
