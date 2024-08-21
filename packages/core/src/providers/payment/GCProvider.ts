import { PaymentForm, PaymentMethod } from "@beabee/beabee-common";

import gocardless, {
  createSubscription,
  updateOrCreateSubscription,
  prorateSubscription,
  hasPendingPayment
} from "#lib/gocardless";
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

const log = mainLogger.child({ app: "gc-payment-provider" });

class GCProvider implements PaymentProvider {
  /**
   * Check if contribution can be changed. GoCardless contributions can't always
   * be changed if there is a pending payment, because pending payments can't
   * always be cancelled, so there would be a risk of double charging.
   *
   * @param contribution The contribution
   * @param useExistingMandate Whether or not to use the existing mandate
   * @param paymentForm The new payment form
   * @returns if the contribution can be changed
   */
  async canChangeContribution(
    contribution: ContactContribution,
    useExistingMandate: boolean,
    paymentForm: PaymentForm
  ): Promise<boolean> {
    return (
      // Monthly contributors can update their amount at any time as long as
      // they aren't trying to change the payment method
      (useExistingMandate &&
        contribution.period === "monthly" &&
        paymentForm.period === "monthly") ||
      // If there is no active mandate then a new one can be created
      !contribution.mandateId ||
      // Otherwise ensure there are no pending payments to prevent double charging
      !(await hasPendingPayment(contribution.mandateId))
    );
  }

  /**
   * Fetch information about the direct debit and whether there are pending
   * payments
   *
   * @param contribution The contribution
   * @returns The additional information
   */
  async getContributionInfo(
    contribution: ContactContribution
  ): Promise<GetContributionInfoResult> {
    try {
      if (contribution.mandateId) {
        const mandate = await gocardless.mandates.get(contribution.mandateId);
        const bankAccount = await gocardless.customerBankAccounts.get(
          mandate.links!.customer_bank_account!
        );

        const pendingPayment = await hasPendingPayment(contribution.mandateId);

        return {
          paymentSource: {
            method: PaymentMethod.GoCardlessDirectDebit,
            bankName: bankAccount.bank_name || "",
            accountHolderName: bankAccount.account_holder_name || "",
            accountNumberEnding: bankAccount.account_number_ending || ""
          },
          hasPendingPayment: pendingPayment
        };
      }
    } catch (err: any) {
      // 404s can happen on dev as we don't use real mandate IDs
      if (!(config.dev && err.response && err.response.status === 404)) {
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
    log.info("Cancel subscription for " + contribution.contact.id, {
      keepMandate
    });

    if (contribution.mandateId && !keepMandate) {
      await gocardless.mandates.cancel(contribution.mandateId);
    }
    if (contribution.subscriptionId) {
      await gocardless.subscriptions.cancel(contribution.subscriptionId);
    }

    return {
      mandateId: keepMandate ? contribution.mandateId : null,
      subscriptionId: null
    };
  }

  /**
   * Update the payment method for a contribution. GoCardless doesn't support
   * updating the payment method directly, so we have to cancel the existing
   * subscription and mandate, then recreate the subscription on the new mandate
   *
   * @param contribution The contribution
   * @param completedPaymentFlow The completed payment flow
   * @returns Updated contribution information
   */
  async updatePaymentMethod(
    contribution: ContactContribution,
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<UpdatePaymentMethodResult> {
    log.info("Update payment source for " + contribution.contact.id, {
      userId: contribution.contact.id,
      data: contribution,
      completedPaymentFlow
    });

    let subscriptionId = contribution.subscriptionId;

    if (contribution.mandateId) {
      // TODO: protect against race conditions
      await this.cancelContribution(contribution, false);

      // Recreate the subscription on the new mandate
      if (subscriptionId && contribution.period && contribution.monthlyAmount) {
        const subscription = await createSubscription(contribution.mandateId, {
          monthlyAmount: contribution.monthlyAmount,
          period: contribution.period,
          payFee: !!contribution.payFee,
          prorate: false
        });

        subscriptionId = subscription.id!;
      }
    }

    return {
      customerId: completedPaymentFlow.customerId,
      mandateId: completedPaymentFlow.mandateId,
      subscriptionId
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
    if (!contribution.mandateId) {
      throw new NoPaymentMethod();
    }

    if (
      contribution.subscriptionId &&
      paymentForm.period !== contribution.period
    ) {
      // GoCardless doesn't support changing the period of a subscription
      // TODO: protect against race conditions
      this.cancelContribution(contribution, false);
      contribution.subscriptionId = null;
    }

    const startDate = calcRenewalDate(contribution.contact);

    const { subscription, expiryDate } = await updateOrCreateSubscription(
      contribution.mandateId,
      paymentForm,
      contribution.subscriptionId,
      startDate
    );

    // Start the subscription now if there is no start date, or check and
    // apply any necessary proration
    const startNow =
      !startDate ||
      (await prorateSubscription(
        contribution.mandateId,
        startDate,
        paymentForm,
        contribution.monthlyAmount || 0
      ));

    log.info("Activate contribution for " + contribution.contact.id, {
      paymentForm,
      startNow,
      subscriptionId: subscription.id,
      expiryDate
    });

    return {
      startNow,
      expiryDate: new Date(expiryDate),
      subscriptionId: subscription.id!
    };
  }

  /**
   * Update a contact's email, firstname or lastname in GoCardless if they've changed
   *
   * @param contribution The contribution
   * @param updates The updates to apply
   */
  async onUpdateContact(
    contribution: ContactContribution,
    updates: Partial<Contact>
  ): Promise<void> {
    if (
      (updates.email || updates.firstname || updates.lastname) &&
      contribution.customerId
    ) {
      log.info("Update contact in GoCardless");
      await gocardless.customers.update(contribution.customerId, {
        ...(updates.email && { email: updates.email }),
        ...(updates.firstname && { given_name: updates.firstname }),
        ...(updates.lastname && { family_name: updates.lastname })
      });
    }
  }

  /**
   * Permanently delete a customer from GoCardless
   *
   * @param contribution The contribution
   */
  async permanentlyDeleteContact(
    contribution: ContactContribution
  ): Promise<void> {
    if (contribution.mandateId) {
      await gocardless.mandates.cancel(contribution.mandateId);
    }
    if (contribution.customerId) {
      await gocardless.customers.remove(contribution.customerId);
    }
  }
}

export default new GCProvider();
