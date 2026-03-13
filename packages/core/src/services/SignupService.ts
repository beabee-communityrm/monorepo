import {
  PaymentFlowParams,
  PaymentFlowParamsStripe,
  PaymentFlowResult,
  PaymentMethod,
  RESET_SECURITY_FLOW_TYPE,
} from '@beabee/beabee-common';

import { getRepository } from '#database';
import { DuplicateEmailError, NotFoundError } from '#errors/index';
import { log as mainLogger } from '#logging';
import { Contact, Password, PaymentFlow, SignupFlow } from '#models/index';
import ContactsService from '#services/ContactsService';
import EmailService from '#services/EmailService';
import OptionsService from '#services/OptionsService';
import PaymentFlowService from '#services/PaymentFlowService';
import { PaymentFlowForm } from '#type/index';

import ResetSecurityFlowService from './ResetSecurityFlowService';

const log = mainLogger.child({ app: 'signup-service' });

interface SignupData {
  email: string;
  password: Password;
  loginUrl: string;
  setPasswordUrl: string;
  confirmUrl: string;
}

/**
 * Service that manages user signup and registration flows.
 * Handles email confirmation, account creation, and coordination with payment flows.
 */
class SignupService {
  /**
   * Starts a simple registration flow without payment, sending a confirmation email
   * @param signupData - Basic user information (email and password)
   * @returns Promise that resolves when the flow is started
   */
  async startSimpleSignup(signupData: SignupData): Promise<void> {
    const signupFlow = await getRepository(SignupFlow).save({
      ...signupData,
      paymentFlowId: null,
    });

    await this.sendConfirmationEmail(signupFlow);
  }

  /**
   * Starts a signup flow with payment, coordinating between signup and payment flows
   * @param signupData - User signup information
   * @param form - Payment form data
   * @param params - Payment flow parameters
   * @returns The payment flow result for the client
   */
  async startSignupWithPayment(
    signupData: SignupData,
    form: PaymentFlowForm,
    params: PaymentFlowParams
  ): Promise<PaymentFlowResult> {
    const setup = await PaymentFlowService.startPaymentFlow(form, params);

    await getRepository(SignupFlow).save({
      ...signupData,
      paymentFlowId: setup.flow.id,
    });

    return setup.result;
  }

  /**
   * Advances a signup flow with payment by updating the payment flow form data
   * and sending confirmation email.
   *
   * @param paymentFlowId - The ID of the payment flow to advance
   */
  async advanceSignupWithPayment(
    paymentFlowId: string,
    data: Partial<
      Pick<PaymentFlowParamsStripe, 'firstname' | 'lastname' | 'vatNumber'>
    >
  ): Promise<void> {
    const signupFlow = await getRepository(SignupFlow).findOne({
      where: { paymentFlow: { paymentFlowId } },
      relations: { paymentFlow: true },
    });

    if (!signupFlow?.paymentFlow) {
      throw new NotFoundError();
    }

    // TODO: remove once payment flow logic reworked
    for (const key of ['firstname', 'lastname', 'vatNumber'] as const) {
      if (data[key]) {
        (signupFlow.paymentFlow.params as PaymentFlowParamsStripe)[key] =
          data[key];
      }
    }
    await getRepository(PaymentFlow).save(signupFlow.paymentFlow);

    // Finalise one-time payments early
    if (signupFlow.paymentFlow.form.action === 'create-one-time-payment') {
      const contact = await this.finalizeSignup(signupFlow.id);
      // Ignore a failure to create a contact here. This means this flow is
      // being processed elsewhere, probably because the user opened the URL
      // twice accidentally. Don't send the confirmation email though as
      // otherwise that will be sent twice
      if (!contact) {
        return;
      }
    }

    await this.sendConfirmationEmail(signupFlow);
  }

  /**
   * Sends the appropriate email for the given signup flow based on the contact's
   * status and signup type.
   * @param signupFlow The signup flow
   */
  private async sendConfirmationEmail(signupFlow: SignupFlow): Promise<void> {
    log.info('Send confirm email for signup flow ' + signupFlow.id);

    const contact = await ContactsService.findOneBy({
      email: signupFlow.email,
    });

    const isOneTime =
      signupFlow.paymentFlow?.form.action === 'create-one-time-payment';

    if (
      // Contact already exists with an active contribution
      contact?.membership?.isActive ||
      // One-time contribution and their account was previously setup
      (isOneTime && contact?.password.hash)
    ) {
      if (contact.password.hash) {
        await EmailService.sendTemplateToContact(
          'email-exists-login',
          contact,
          {
            loginLink: signupFlow.loginUrl,
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
            spLink: signupFlow.setPasswordUrl + '/' + rpFlow.id,
          }
        );
      }
    } else {
      let firstName = '',
        lastName = '';

      // TODO: remove once payment flow logic is reworked
      if (
        signupFlow.paymentFlow &&
        signupFlow.paymentFlow.params.paymentMethod !==
          PaymentMethod.GoCardlessDirectDebit
      ) {
        firstName = signupFlow.paymentFlow.params.firstname || '';
        lastName = signupFlow.paymentFlow.params.lastname || '';
      }

      // User doesn't exist, their membership is inactive or they are not
      // starting a recurring contribution, ask them to confirm their email
      // address so they can continue the signup flow
      await EmailService.sendTemplateTo(
        isOneTime ? 'setup-account' : 'confirm-email',
        { email: signupFlow.email },
        {
          firstName,
          lastName,
          confirmLink: signupFlow.confirmUrl + '/' + signupFlow.id,
        }
      );
    }
  }
  /**
   * Finalizes a signup flow after email confirmation, creating the contact
   * @param signupFlowId - The ID of the signup flow to finalize
   * @returns The created contact
   */
  async finalizeSignup(signupFlowId: string): Promise<Contact | undefined> {
    const signupFlow = await getRepository(SignupFlow).findOne({
      where: { id: signupFlowId },
      relations: { contact: true, paymentFlow: true },
    });

    if (!signupFlow) {
      throw new NotFoundError();
    }

    // This flow has already been finalized
    if (signupFlow.contact) {
      return signupFlow.contact;
    }

    // Use atomic update to prevent multiple simultaneous attempts to finalize
    // the same flow
    const res = await getRepository(SignupFlow).update(
      { id: signupFlow.id, processing: false },
      { processing: true }
    );
    if (res.affected === 0) {
      return;
    }

    let contact = await ContactsService.findOne({
      where: { email: signupFlow.email },
      relations: { profile: true },
    });

    // Check if contact already exists with active membership
    if (
      contact?.membership?.isActive &&
      signupFlow.paymentFlow?.form.action === 'start-contribution'
    ) {
      throw new DuplicateEmailError();
    }

    let completedFlow;
    const partialContact: Partial<Contact> & { email: string } = {
      email: signupFlow.email,
      password: signupFlow.password,
    };

    if (signupFlow.paymentFlow) {
      completedFlow = await PaymentFlowService.completePaymentFlowAndGetData(
        signupFlow.paymentFlow
      );
      if (!completedFlow) {
        return;
      }

      if (completedFlow.data.firstname) {
        partialContact.firstname = completedFlow.data.firstname;
      }
      if (completedFlow.data.lastname) {
        partialContact.lastname = completedFlow.data.lastname;
      }
    }

    if (contact) {
      await ContactsService.updateContact(contact, partialContact);
    } else {
      contact = await ContactsService.createContact(partialContact, {
        newsletterStatus: OptionsService.getText('newsletter-default-status'),
        ...(completedFlow?.data.billingAddress &&
          OptionsService.getBool('show-mail-opt-in') && {
            deliveryAddress: completedFlow.data.billingAddress,
          }),
      });
    }

    if (completedFlow) {
      await PaymentFlowService.executePaymentActions(
        contact,
        completedFlow.flow
      );
    }

    // One-time contributions receive a separate one-time-donation email
    if (signupFlow.paymentFlow?.form.action !== 'create-one-time-payment') {
      await EmailService.sendTemplateToContact('welcome', contact);
    }

    await getRepository(SignupFlow).update(signupFlow.id, {
      contactId: contact.id,
    });

    return contact;
  }

  /**
   * Permanently deletes all signup flows associated with a contact
   * @param contact The contact
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    await getRepository(SignupFlow).delete({ contactId: contact.id });
  }
}

export const signupService = new SignupService();
export default signupService;
