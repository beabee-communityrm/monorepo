import { ContributionType, PaymentForm } from "@beabee/beabee-common";
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
  GetContributionInfoResult,
  PaymentProvider,
  UpdateContributionResult,
  UpdatePaymentMethodResult
} from "#type/index";

const log = mainLogger.child({ app: "stripe-payment-provider" });

class StripeProvider implements PaymentProvider {
  /**
   * Check if contribution can be changed. Stripe contributions can always be
   * changed if there is a mandate available
   *
   * @param contribution The contribution
   * @param useExistingMandate Whether or not to use the existing mandate
   * @returns if the contribution can be changed
   */
  async canChangeContribution(
    contribution: ContactContribution,
    useExistingMandate: boolean
  ): Promise<boolean> {
    return !useExistingMandate || !!contribution.mandateId;
  }

  /**
   * Fetch information about the payment source
   *
   * @param contribution The contribution
   * @returns The additional information
   */
  async getContributionInfo(
    contribution: ContactContribution
  ): Promise<GetContributionInfoResult> {
    try {
      const paymentSource = contribution.mandateId
        ? await manadateToSource(contribution.mandateId)
        : undefined;
      return { ...(paymentSource && { paymentSource }) };
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

    return {};
  }

  /**
   * Cancel the subscription and optionally the mandate
   *
   * @param contribution The contribution
   * @param keepMandate Whether or not to keep the mandate
   * @returns Updated contribution information
   */
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

  /**
   * Update the payment method for a contribution.  This attaches a new payment
   * method to a customer and detaches any existing one. It will create the
   * Stripe customer if it doesn't yet exist.
   *
   * @param contribution The contribution
   * @param flow The completed payment flow
   * @returns Updated contribution information
   */
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
      // TODO: Update tax_id_data if VAT number was passed through the payment flow
    } else {
      log.info("Create new customer");
      const customer = await stripe.customers.create({
        email: contribution.contact.email,
        name: `${contribution.contact.firstname} ${contribution.contact.lastname}`,
        payment_method: flow.mandateId,
        // Add VAT number if it was passed through the payment flow
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

  /**
   * Update a contribution using the payment form. This will either create a new
   * subscription or update the existing one.
   *
   * @param contribution The contribution
   * @param paymentForm The payment form
   * @returns Updated contribution information
   */
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

    log.info("Activate contribution for  " + contribution.contact.id, {
      userId: contribution.contact.id,
      paymentForm,
      startNow,
      subscriptionId: subscription.id
    });

    return {
      startNow,
      expiryDate: new Date(subscription.current_period_end * 1000),
      subscriptionId: subscription.id
    };
  }

  /**
   * Update a contact's email, firstname or lastname in Stripe if they've changed
   *
   * @param contribution The contribution
   * @param updates The updates to apply
   */
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

  /**
   * Permanently delete a customer from Stripe
   *
   * @param contribution The contribution
   */
  async permanentlyDeleteContact(
    contribution: ContactContribution
  ): Promise<void> {
    if (contribution.customerId) {
      await stripe.customers.del(contribution.customerId);
    }
  }

  /**
   * Update a subscription if a successful one exists, otherwise cancel any
   * failing ones and create a new one
   *
   * @param contribution The contribution
   * @param paymentForm The payment form
   * @returns The Stripe subscription and whether it should start now
   */
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
      // Cancel any existing (failing) subscription
      await this.cancelContribution(contribution, true);

      log.info("Creating new subscription");
      const subscription = await createSubscription(
        contribution.customerId!, // customerId is asserted in updateContribution
        paymentForm,
        contribution.method,
        calcRenewalDate(contribution.contact)
      );

      return { subscription, startNow: true };
    }
  }
}

export default new StripeProvider();
