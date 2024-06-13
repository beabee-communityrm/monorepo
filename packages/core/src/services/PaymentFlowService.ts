import {
  ContributionPeriod,
  PaymentMethod,
  RESET_SECURITY_FLOW_TYPE
} from "@beabee/beabee-common";

import { database } from "#core/database";
import { log as mainLogger } from "#core/logging";

import { emailService } from "#core/services/EmailService";
import { contactsService } from "#core/services/ContactsService";
import { optionsService } from "#core/services/OptionsService";
import { paymentService } from "#core/services/PaymentService";
import { resetSecurityFlowService } from "#core/services/ResetSecurityFlowService";
import { JoinFlow, JoinForm, Contact } from "@beabee/models";
import type {
  Address,
  PaymentFlow,
  PaymentFlowData,
  PaymentFlowParams
} from "@beabee/beabee-common";

import type { LocaleObject } from "@beabee/locales";

import { PaymentFlowProvider } from "#core/providers/payment-flow/index";
import { stripeProvider } from "#core/providers/payment-flow/StripeProvider";
import { gcProvider } from "#core/providers/payment-flow/GCProvider";

import { DuplicateEmailError } from "#errors/index";

import type {
  CompleteUrls,
  CompletedPaymentFlow,
  CompletedPaymentFlowData
} from "#types/index";

const paymentProviders = {
  [PaymentMethod.StripeCard]: stripeProvider,
  [PaymentMethod.StripeSEPA]: stripeProvider,
  [PaymentMethod.StripeBACS]: stripeProvider,
  [PaymentMethod.StripePayPal]: stripeProvider,
  [PaymentMethod.GoCardlessDirectDebit]: gcProvider
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
    return await database.getRepository(JoinFlow).save({
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
    const joinFlow = await database.getRepository(JoinFlow).save({
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
    await database.getRepository(JoinFlow).update(joinFlow.id, {
      paymentFlowId: paymentFlow.id
    });
    return paymentFlow.params;
  }

  async getJoinFlowByPaymentId(
    paymentFlowId: string
  ): Promise<JoinFlow | null> {
    return await database.getRepository(JoinFlow).findOneBy({ paymentFlowId });
  }

  async completeJoinFlow(joinFlow: JoinFlow): Promise<CompletedPaymentFlow> {
    log.info("Completing join flow " + joinFlow.id);
    const paymentFlow = await this.completePaymentFlow(joinFlow);
    await database.getRepository(JoinFlow).delete(joinFlow.id);
    return paymentFlow;
  }

  async sendConfirmEmail(
    joinFlow: JoinFlow,
    locale: LocaleObject
  ): Promise<void> {
    log.info("Send confirm email for join flow " + joinFlow.id);

    const contact = await contactsService.findOneBy({
      email: joinFlow.joinForm.email
    });

    if (contact?.membership?.isActive) {
      if (contact.password.hash) {
        await emailService.sendTemplateToContact(
          "email-exists-login",
          contact,
          {
            loginLink: joinFlow.loginUrl
          },
          locale
        );
      } else {
        const rpFlow = await resetSecurityFlowService.create(
          contact,
          RESET_SECURITY_FLOW_TYPE.PASSWORD
        );
        await emailService.sendTemplateToContact(
          "email-exists-set-password",
          contact,
          {
            spLink: joinFlow.setPasswordUrl + "/" + rpFlow.id
          },
          locale
        );
      }
    } else {
      await emailService.sendTemplateTo(
        "confirm-email",
        { email: joinFlow.joinForm.email },
        {
          firstName: joinFlow.joinForm.firstname || "",
          lastName: joinFlow.joinForm.lastname || "",
          confirmLink: joinFlow.confirmUrl + "/" + joinFlow.id
        },
        locale
      );
    }
  }

  async completeConfirmEmail(
    joinFlow: JoinFlow,
    locale: LocaleObject
  ): Promise<Contact> {
    // Check for an existing active member first to avoid completing the join
    // flow unnecessarily. This should never really happen as the user won't
    // get a confirm email if they are already an active member
    let contact = await contactsService.findOne({
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

    let completedPaymentFlow: CompletedPaymentFlow | undefined;
    let deliveryAddress: Address | undefined;

    // Only complete join flow for those with a contribution
    // TODO: rework join flow to properly accommodate no contributions
    if (joinFlow.joinForm.monthlyAmount !== 0) {
      completedPaymentFlow = await this.completeJoinFlow(joinFlow);
      const paymentData =
        await this.getCompletedPaymentFlowData(completedPaymentFlow);

      // Prefill contact data from payment provider if possible
      partialContact.firstname ||= paymentData.firstname || "";
      partialContact.lastname ||= paymentData.lastname || "";
      deliveryAddress = optionsService.getBool("show-mail-opt-in")
        ? paymentData.billingAddress
        : undefined;
    }

    if (contact) {
      await contactsService.updateContact(contact, partialContact);
    } else {
      contact = await contactsService.createContact(
        partialContact,
        deliveryAddress ? { deliveryAddress } : undefined,
        locale
      );
    }

    if (completedPaymentFlow) {
      await paymentService.updatePaymentMethod(contact, completedPaymentFlow);
      await contactsService.updateContactContribution(
        contact,
        joinFlow.joinForm,
        locale
      );
    }

    await emailService.sendTemplateToContact(
      "welcome",
      contact,
      undefined,
      locale
    );

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
