import {
  Address,
  ContributionPeriod,
  PaymentMethod,
  RESET_SECURITY_FLOW_TYPE
} from "@beabee/beabee-common";

import { getRepository } from "#database";
import { log as mainLogger } from "#logging";

import EmailService from "#services/EmailService";
import ContactsService from "#services/ContactsService";
import OptionsService from "#services/OptionsService";
import PaymentService from "#services/PaymentService";
import ResetSecurityFlowService from "./ResetSecurityFlowService";
import { JoinFlow, JoinForm, Contact } from "#models/index";

import {
  PaymentFlowProvider,
  stripeFlowProvider,
  gcFlowProvider
} from "#providers/payment-flow";

import { DuplicateEmailError } from "#errors/index";

import {
  CompleteUrls,
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlow,
  PaymentFlowData,
  PaymentFlowParams
} from "#type/index";

const paymentProviders = {
  [PaymentMethod.StripeCard]: stripeFlowProvider,
  [PaymentMethod.StripeSEPA]: stripeFlowProvider,
  [PaymentMethod.StripeBACS]: stripeFlowProvider,
  [PaymentMethod.StripePayPal]: stripeFlowProvider,
  [PaymentMethod.StripeIdeal]: stripeFlowProvider,
  [PaymentMethod.GoCardlessDirectDebit]: gcFlowProvider
};

const log = mainLogger.child({ app: "payment-flow-service" });

class PaymentFlowService implements PaymentFlowProvider {
  async createJoinFlow(
    form: Pick<JoinForm, "email" | "password">,
    urls: CompleteUrls
  ): Promise<JoinFlow> {
    const joinForm: JoinForm = {
      ...form,
      monthlyAmount: 0, // Currently used below to flag a no contribution join flow
      // TODO: stubbed here, should be optional
      period: ContributionPeriod.Monthly,
      payFee: false,
      prorate: false,
      paymentMethod: PaymentMethod.StripeCard
    };
    return await getRepository(JoinFlow).save({
      ...urls,
      joinForm,
      paymentFlowId: ""
    });
  }

  async createPaymentJoinFlow(
    joinForm: JoinForm,
    urls: CompleteUrls,
    completeUrl: string,
    user: { email: string; firstname?: string; lastname?: string }
  ): Promise<PaymentFlowParams> {
    const joinFlow = await getRepository(JoinFlow).save({
      ...urls,
      joinForm,
      paymentFlowId: ""
    });

    log.info("Creating payment join flow " + joinFlow.id, { joinForm });

    const paymentFlow = await this.createPaymentFlow(
      joinFlow,
      completeUrl,
      user
    );
    await getRepository(JoinFlow).update(joinFlow.id, {
      paymentFlowId: paymentFlow.id
    });
    return paymentFlow.params;
  }

  async getJoinFlowByPaymentId(
    paymentFlowId: string
  ): Promise<JoinFlow | null> {
    return await getRepository(JoinFlow).findOneBy({ paymentFlowId });
  }

  async completeJoinFlow(
    joinFlow: JoinFlow
  ): Promise<CompletedPaymentFlow | undefined> {
    log.info("Completing join flow " + joinFlow.id);
    const paymentFlow = joinFlow.paymentFlowId
      ? await this.completePaymentFlow(joinFlow)
      : undefined;
    await getRepository(JoinFlow).delete(joinFlow.id);
    return paymentFlow;
  }

  async sendConfirmEmail(joinFlow: JoinFlow): Promise<void> {
    log.info("Send confirm email for join flow " + joinFlow.id);

    const contact = await ContactsService.findOneBy({
      email: joinFlow.joinForm.email
    });

    if (contact?.membership?.isActive) {
      if (contact.password.hash) {
        await EmailService.sendTemplateToContact(
          "email-exists-login",
          contact,
          {
            loginLink: joinFlow.loginUrl
          }
        );
      } else {
        const rpFlow = await ResetSecurityFlowService.create(
          contact,
          RESET_SECURITY_FLOW_TYPE.PASSWORD
        );
        await EmailService.sendTemplateToContact(
          "email-exists-set-password",
          contact,
          {
            spLink: joinFlow.setPasswordUrl + "/" + rpFlow.id
          }
        );
      }
    } else {
      await EmailService.sendTemplateTo(
        "confirm-email",
        { email: joinFlow.joinForm.email },
        {
          firstName: joinFlow.joinForm.firstname || "",
          lastName: joinFlow.joinForm.lastname || "",
          confirmLink: joinFlow.confirmUrl + "/" + joinFlow.id
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
      relations: { profile: true }
    });
    if (contact?.membership?.isActive) {
      throw new DuplicateEmailError();
    }

    const partialContact = {
      email: joinFlow.joinForm.email,
      password: joinFlow.joinForm.password,
      firstname: joinFlow.joinForm.firstname || "",
      lastname: joinFlow.joinForm.lastname || ""
    };

    const completedPaymentFlow = await this.completeJoinFlow(joinFlow);
    let deliveryAddress: Address | undefined;

    if (completedPaymentFlow) {
      const paymentData =
        await this.getCompletedPaymentFlowData(completedPaymentFlow);

      // Prefill contact data from payment provider if possible
      partialContact.firstname ||= paymentData.firstname || "";
      partialContact.lastname ||= paymentData.lastname || "";
      deliveryAddress = OptionsService.getBool("show-mail-opt-in")
        ? paymentData.billingAddress
        : undefined;
    }

    if (contact) {
      await ContactsService.updateContact(contact, partialContact);
    } else {
      contact = await ContactsService.createContact(partialContact, {
        newsletterStatus: OptionsService.getText("newsletter-default-status"),
        deliveryAddress: deliveryAddress || null
      });
    }

    if (completedPaymentFlow) {
      await PaymentService.updatePaymentMethod(contact, completedPaymentFlow);
      await ContactsService.updateContactContribution(
        contact,
        joinFlow.joinForm
      );
    }

    await EmailService.sendTemplateToContact("welcome", contact);

    return contact;
  }

  async createPaymentFlow(
    joinFlow: JoinFlow,
    completeUrl: string,
    data: PaymentFlowData
  ): Promise<PaymentFlow> {
    log.info("Create payment flow for join flow " + joinFlow.id);
    return paymentProviders[joinFlow.joinForm.paymentMethod].createPaymentFlow(
      joinFlow,
      completeUrl,
      data
    );
  }

  async completePaymentFlow(joinFlow: JoinFlow): Promise<CompletedPaymentFlow> {
    log.info("Complete payment flow for join flow " + joinFlow.id);
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
