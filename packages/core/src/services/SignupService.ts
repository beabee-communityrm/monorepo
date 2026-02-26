import {
  Address,
  PaymentFlowParams,
  PaymentFlowResult,
  RESET_SECURITY_FLOW_TYPE,
} from '@beabee/beabee-common';

import { getRepository } from '#database';
import { DuplicateEmailError, NotFoundError } from '#errors/index';
import { log as mainLogger } from '#logging';
import { Contact, Password, SignupFlow } from '#models/index';
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
   * @param paymentData - Payment form data
   * @param paymentFlowParams - Parameters for the payment flow
   * @returns The payment flow result for the client
   */
  async startSignupWithPayment(
    signupData: SignupData,
    paymentData: PaymentFlowForm,
    paymentFlowParams: PaymentFlowParams
  ): Promise<PaymentFlowResult> {
    // Start the payment flow first
    const paymentResult = await PaymentFlowService.startPaymentFlow(
      paymentData,
      paymentFlowParams
    );

    // Create the signup flow linked to the payment flow
    await getRepository(SignupFlow).save({
      ...signupData,
      paymentFlowId: paymentResult.paymentFlowEntityId,
    });

    return paymentResult.result;
  }

  async advanceSignupWithPayment(signupFlowId: string): Promise<void> {
    const signupFlow = await getRepository(SignupFlow).findOne({
      where: { id: signupFlowId },
      relations: { paymentFlow: true },
    });

    if (!signupFlow?.paymentFlow) {
      throw new NotFoundError();
    }

    // Finalise one-time payments early
    if (signupFlow.paymentFlow.form.action === 'create-one-time-payment') {
      await this.finalizeSignup(signupFlowId);
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
      // User doesn't exist, their membership is inactive or they are not
      // starting a recurring contribution, ask them to confirm their email
      // address so they can continue the signup flow
      await EmailService.sendTemplateTo(
        isOneTime ? 'setup-account' : 'confirm-email',
        { email: signupFlow.email },
        {
          firstName: '', // TODO: could get from payment flow if available
          lastName: '', // TODO: could get from payment flow if available
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
  async finalizeSignup(signupFlowId: string): Promise<Contact> {
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

    const partialContact: Partial<Contact> & { email: string } = {
      email: signupFlow.email,
      password: signupFlow.password,
    };
    let billingAddress;

    if (signupFlow.paymentFlow) {
      const flowData = await PaymentFlowService.completePaymentFlowAndGetData(
        signupFlow.paymentFlow
      );

      // If there's a payment flow, get additional data from provider
      if (flowData.firstname) {
        partialContact.firstname = flowData.firstname;
      }
      if (flowData.lastname) {
        partialContact.lastname = flowData.lastname;
      }

      billingAddress = flowData.billingAddress;
    }

    if (contact) {
      await ContactsService.updateContact(contact, partialContact);
    } else {
      contact = await ContactsService.createContact(partialContact, {
        newsletterStatus: OptionsService.getText('newsletter-default-status'),
        ...(billingAddress &&
          OptionsService.getBool('show-mail-opt-in') && {
            deliveryAddress: billingAddress,
          }),
      });
    }

    if (signupFlow.paymentFlow) {
      await PaymentFlowService.executeAndCleanupPaymentFlow(
        contact,
        signupFlow.paymentFlow
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
