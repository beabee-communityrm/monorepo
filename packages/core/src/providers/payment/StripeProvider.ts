import {
  ContributionType,
  PaymentForm,
  PaymentSource
} from "@beabee/beabee-common";
import { add } from "date-fns";
import Stripe from "stripe";

import {
  stripe,
  createSubscription,
  deleteSubscription,
  manadateToSource,
  updateSubscription
} from "#lib/stripe";
import { log as mainLogger } from "#logging";
import { calcRenewalDate } from "#utils/payment";

import { Contact, ContactContribution } from "#models/index";

import { NoPaymentMethod } from "#errors/index";

import config from "#config/config";

import {
  CancelContributionResult,
  CompletedPaymentFlow,
  ContributionInfo,
  PaymentProvider,
  UpdateContributionResult,
  UpdatePaymentMethodResult
} from "#type/index";

const log = mainLogger.child({ app: "stripe-payment-provider" });

class StripeProvider implements PaymentProvider {
  async canChangeContribution(
    contribution: ContactContribution,
    useExistingMandate: boolean
  ): Promise<boolean> {
    return !useExistingMandate || !!contribution.mandateId;
  }

  async getContributionInfo(
    contribution: ContactContribution
  ): Promise<Partial<ContributionInfo>> {
    let paymentSource: PaymentSource | undefined;
    try {
      paymentSource = contribution.mandateId
        ? await manadateToSource(contribution.mandateId)
        : undefined;
    } catch (err) {
      // 404s can happen on dev as we don't use real mandate IDs
      if (
        !(
          config.dev &&
          err instanceof Stripe.errors.StripeInvalidRequestError &&
          err.statusCode === 404
        )
      ) {
        throw err;
      }
    }

    return {
      ...(paymentSource && { paymentSource })
    };
  }

  async cancelContribution(
    contribution: ContactContribution,
    keepMandate: boolean
  ): Promise<CancelContributionResult> {
    if (contribution.mandateId && !keepMandate) {
      await stripe.paymentMethods.detach(contribution.mandateId);
    }
    if (contribution.subscriptionId) {
      await deleteSubscription(contribution.subscriptionId);
    }

    return {
      mandateId: keepMandate ? contribution.mandateId : null,
      subscriptionId: null
    };
  }

  async updatePaymentMethod(
    contribution: ContactContribution,
    flow: CompletedPaymentFlow
  ): Promise<UpdatePaymentMethodResult> {
    const paymentMethod = await stripe.paymentMethods.retrieve(flow.mandateId);
    const address = paymentMethod.billing_details.address;

    const customerData: Stripe.CustomerUpdateParams = {
      invoice_settings: {
        default_payment_method: flow.mandateId
      },
      address: address
        ? {
            line1: address.line1 || "",
            ...(address.city && { city: address.city }),
            ...(address.country && { country: address.country }),
            ...(address.line2 && { line2: address.line2 }),
            ...(address.postal_code && { postal_code: address.postal_code }),
            ...(address.state && { state: address.state })
          }
        : null
    };

    let customerId = contribution.customerId;
    if (customerId) {
      log.info("Attach new payment source to " + customerId);
      await stripe.paymentMethods.attach(flow.mandateId, {
        customer: customerId
      });
      await stripe.customers.update(customerId, customerData);
    } else {
      log.info("Create new customer");
      const customer = await stripe.customers.create({
        email: contribution.contact.email,
        name: `${contribution.contact.firstname} ${contribution.contact.lastname}`,
        payment_method: flow.mandateId,
        ...(flow.vatNumber && {
          tax_id_data: [
            {
              type: "eu_vat",
              value: flow.vatNumber
            }
          ]
        }),
        ...customerData
      });
      customerId = customer.id;
    }

    if (contribution.mandateId) {
      log.info("Detach old payment method " + contribution.mandateId);
      await stripe.paymentMethods.detach(contribution.mandateId);
    }

    return {
      customerId,
      mandateId: flow.mandateId
    };
  }

  async updateContribution(
    contribution: ContactContribution,
    paymentForm: PaymentForm
  ): Promise<UpdateContributionResult> {
    if (!contribution.customerId || !contribution.mandateId) {
      throw new NoPaymentMethod();
    }

    // Manual contributors don't have a real subscription yet, create one on
    // their previous amount so Stripe can automatically handle any proration
    if (
      contribution.contact.membership?.isActive &&
      contribution.contact.contributionType === ContributionType.Manual
    ) {
      log.info("Creating new subscription for manual contributor");
      const newSubscription = await createSubscription(
        contribution.customerId,
        {
          ...paymentForm,
          monthlyAmount: contribution.monthlyAmount || 0
        },
        contribution.method,
        calcRenewalDate(contribution.contact)
      );
      // Set this for the updateOrCreateContribution call below
      contribution.subscriptionId = newSubscription.id;
    }

    const { subscription, startNow } = await this.updateOrCreateContribution(
      contribution,
      paymentForm
    );

    return {
      startNow,
      expiryDate: add(
        new Date(subscription.current_period_end * 1000),
        config.gracePeriod
      ),
      subscriptionId: subscription.id
    };
  }

  private async updateOrCreateContribution(
    contribution: ContactContribution,
    paymentForm: PaymentForm
  ): Promise<{ subscription: Stripe.Subscription; startNow: boolean }> {
    if (
      contribution.subscriptionId &&
      contribution.contact.membership?.isActive
    ) {
      log.info("Update subscription " + contribution.subscriptionId);
      return await updateSubscription(
        contribution.subscriptionId,
        paymentForm,
        contribution.method
      );
    } else {
      // Cancel any existing (failing) subscriptions
      await this.cancelContribution(contribution, true);

      log.info("Create subscription");
      const subscription = await createSubscription(
        contribution.customerId!, // customerId is asserted in updateContribution
        paymentForm,
        contribution.method,
        calcRenewalDate(contribution.contact)
      );
      return { subscription, startNow: true };
    }
  }

  async updateContact(
    contribution: ContactContribution,
    updates: Partial<Contact>
  ): Promise<void> {
    if (
      (updates.email || updates.firstname || updates.lastname) &&
      contribution.customerId
    ) {
      log.info("Update contact");
      await stripe.customers.update(contribution.customerId, {
        ...(updates.email && { email: updates.email }),
        ...((updates.firstname || updates.lastname) && {
          name: `${updates.firstname} ${updates.lastname}`
        })
      });
    }
  }

  async permanentlyDeleteContact(
    contribution: ContactContribution
  ): Promise<void> {
    if (contribution.customerId) {
      await stripe.customers.del(contribution.customerId);
    }
  }
}
export default new StripeProvider();
