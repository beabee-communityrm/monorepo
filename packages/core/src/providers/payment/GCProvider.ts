import { PaymentForm, PaymentMethod } from "@beabee/beabee-common";
import { Subscription } from "gocardless-nodejs";
import moment from "moment";

import gocardless, {
  createSubscription,
  updateSubscription,
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
  ContributionInfo,
  PaymentProvider,
  UpdateContributionResult,
  UpdatePaymentMethodResult
} from "#type/index";

const log = mainLogger.child({ app: "gc-payment-provider" });

class GCProvider implements PaymentProvider {
  async getContributionInfo(
    contribution: ContactContribution
  ): Promise<Partial<ContributionInfo>> {
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

  async canChangeContribution(
    contribution: ContactContribution,
    useExistingMandate: boolean,
    paymentForm: PaymentForm
  ): Promise<boolean> {
    // No payment method available
    if (useExistingMandate && !contribution.mandateId) {
      return false;
    }

    // Can always change contribution if there is no subscription
    if (!contribution.subscriptionId) {
      return true;
    }

    // Monthly contributors can update their contribution amount even if they have
    // pending payments, but they can't always change their period or mandate as this can
    // result in double charging
    return (
      (useExistingMandate &&
        contribution.period === "monthly" &&
        paymentForm.period === "monthly") ||
      !(
        contribution.mandateId &&
        (await hasPendingPayment(contribution.mandateId))
      )
    );
  }

  async updateContribution(
    contribution: ContactContribution,
    paymentForm: PaymentForm
  ): Promise<UpdateContributionResult> {
    log.info("Update contribution for " + contribution.contact.id, {
      userId: contribution.contact.id,
      paymentForm
    });

    if (!contribution.mandateId) {
      throw new NoPaymentMethod();
    }

    let subscription: Subscription | undefined;

    if (contribution.subscriptionId) {
      if (
        contribution.contact.membership?.isActive &&
        contribution.period === paymentForm.period
      ) {
        subscription = await updateSubscription(
          contribution.subscriptionId,
          paymentForm
        );
      } else {
        // Cancel failed subscriptions or when period is changing
        await this.cancelContribution(contribution, true);
      }
    }

    const renewalDate = calcRenewalDate(contribution.contact);
    let expiryDate;

    if (subscription) {
      expiryDate = subscription.upcoming_payments![0].charge_date;
    } else {
      log.info("Creating new subscription");
      subscription = await createSubscription(
        contribution.mandateId,
        paymentForm,
        renewalDate
      );
      // The second payment is the first renewal payment when you first create a subscription
      expiryDate = subscription.upcoming_payments![1].charge_date;
    }

    const startNow =
      !renewalDate ||
      (await prorateSubscription(
        contribution.mandateId,
        renewalDate,
        paymentForm,
        contribution.monthlyAmount || 0
      ));

    log.info("Activate contribution for " + contribution.contact.id, {
      userId: contribution.contact.id,
      paymentForm,
      startNow,
      expiryDate
    });

    return {
      startNow,
      expiryDate: moment.utc(expiryDate).toDate(),
      subscriptionId: subscription.id!
    };
  }

  async cancelContribution(
    contribution: ContactContribution,
    keepMandate: boolean
  ): Promise<CancelContributionResult> {
    log.info("Cancel subscription for " + contribution.contact.id, {
      keepMandate
    });

    const subscriptionId = contribution.subscriptionId;
    const mandateId = contribution.mandateId;

    if (mandateId && !keepMandate) {
      await gocardless.mandates.cancel(mandateId);
    }
    if (subscriptionId) {
      await gocardless.subscriptions.cancel(subscriptionId);
    }

    return {
      mandateId: keepMandate ? mandateId : null,
      subscriptionId: null
    };
  }

  async updatePaymentMethod(
    contribution: ContactContribution,
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<UpdatePaymentMethodResult> {
    log.info("Update payment source for " + contribution.contact.id, {
      userId: contribution.contact.id,
      data: contribution,
      completedPaymentFlow
    });

    const hadSubscription = !!contribution.subscriptionId;

    // Save before cancelling to stop the webhook triggering a cancelled email
    // contribution.subscriptionId = null;
    // TODO await this.updateData();

    if (contribution.mandateId) {
      // This will also cancel the subscription
      await gocardless.mandates.cancel(contribution.mandateId);
    }

    if (hadSubscription && contribution.period && contribution.monthlyAmount) {
      await this.updateContribution(contribution, {
        monthlyAmount: contribution.monthlyAmount,
        period: contribution.period,
        payFee: !!contribution.payFee,
        prorate: false
      });
    }

    return {
      customerId: completedPaymentFlow.customerId,
      mandateId: completedPaymentFlow.mandateId
    };
  }

  async updateContact(
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
