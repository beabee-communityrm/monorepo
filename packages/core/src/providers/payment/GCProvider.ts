import {
  ContributionPeriod,
  PaymentMethod,
  PaymentSource,
} from '@beabee/beabee-common';

import { Subscription } from 'gocardless-nodejs';
import moment from 'moment';

import config from '#config/config';
import { NoPaymentMethodError } from '#errors/index';
import gocardless, {
  createSubscription,
  hasPendingPayment,
  prorateSubscription,
  updateSubscription,
} from '#lib/gocardless';
import { log as mainLogger } from '#logging';
import { Contact } from '#models/index';
import {
  CompletedPaymentFlow,
  ContributionInfo,
  PaymentFlowForm,
  UpdateContributionForm,
  UpdateContributionResult,
} from '#type/index';
import { calcRenewalDate } from '#utils/payment';

import { PaymentProvider } from './PaymentProvider';

const log = mainLogger.child({ app: 'gc-payment-provider' });

/**
 * Implements PaymentProvider for GoCardless direct debit payments.
 * Handles ongoing payment operations for direct debit mandates.
 */
export class GCProvider extends PaymentProvider {
  async canProcessPaymentFlow(form: PaymentFlowForm): Promise<boolean> {
    switch (form.action) {
      case 'create-one-time-payment':
        return false;
      case 'update-payment-method':
        return await this.canChangeContribution(false, {
          monthlyAmount: 0,
          period: ContributionPeriod.Monthly,
          payFee: false,
        });
      case 'start-contribution':
        return await this.canChangeContribution(false, form);
      default:
        return false;
    }
  }

  async processPaymentFlow(
    flow: CompletedPaymentFlow
  ): Promise<UpdateContributionResult | undefined> {
    if (flow.flow.form.action === 'create-one-time-payment') {
      throw new Error('One-time payments are not supported with GoCardless');
    } else {
      await this.updatePaymentMethod(flow);
      if (flow.flow.form.action === 'start-contribution') {
        return await this.processUpdateContribution(flow.flow.form);
      }
    }
  }

  /**
   * Checks if contribution updates are allowed
   * @param form - New payment details
   * @returns Whether contribution updates are allowed
   */
  async canUpdateContribution(form: UpdateContributionForm): Promise<boolean> {
    return await this.canChangeContribution(true, form);
  }

  /**
   * Updates contribution amount and schedule
   * @param form - New payment form data
   * @returns Promise resolving to update result
   */
  async processUpdateContribution(
    form: UpdateContributionForm
  ): Promise<UpdateContributionResult> {
    log.info('Update contribution for ' + this.contact.id, {
      userId: this.contact.id,
      form,
    });

    if (!this.data.mandateId) {
      throw new NoPaymentMethodError();
    }

    let subscription: Subscription | undefined;

    if (this.data.subscriptionId) {
      if (
        this.contact.membership?.isActive &&
        this.contact.contributionPeriod === form.period
      ) {
        subscription = await updateSubscription(this.data.subscriptionId, form);
      } else {
        // Cancel failed subscriptions or when period is changing
        await this.cancelContribution(true);
      }
    }

    const renewalDate = calcRenewalDate(this.contact);
    let expiryDate;

    if (subscription) {
      expiryDate = subscription.upcoming_payments![0].charge_date;
    } else {
      log.info('Creating new subscription');
      subscription = await createSubscription(
        this.data.mandateId,
        form,
        renewalDate
      );
      // The second payment is the first renewal payment when you first create a subscription
      expiryDate = subscription.upcoming_payments![1].charge_date;
    }

    const startNow =
      !renewalDate ||
      (await prorateSubscription(
        this.data.mandateId,
        renewalDate,
        form,
        this.contact.contributionMonthlyAmount || 0
      ));

    log.info('Activate contribution for ' + this.contact.id, {
      userId: this.contact.id,
      form,
      startNow,
      expiryDate,
    });

    this.data.cancelledAt = null;
    this.data.subscriptionId = subscription.id!;
    this.data.payFee = form.payFee;
    this.data.nextAmount = startNow
      ? null
      : {
          monthly: form.monthlyAmount,
          chargeable: Number(subscription.amount),
        };

    await this.updateData();

    return { form, startNow, expiryDate: moment.utc(expiryDate).toDate() };
  }

  /**
   * Retrieves current contribution information including mandate and payment status
   * @returns Promise resolving to partial contribution info
   */
  async getContributionInfo(): Promise<Partial<ContributionInfo>> {
    let paymentSource: PaymentSource | undefined;
    let pendingPayment = false;

    if (this.data.mandateId) {
      try {
        const mandate = await gocardless.mandates.get(this.data.mandateId);
        const bankAccount = await gocardless.customerBankAccounts.get(
          mandate.links!.customer_bank_account!
        );

        paymentSource = {
          method: PaymentMethod.GoCardlessDirectDebit,
          bankName: bankAccount.bank_name || '',
          accountHolderName: bankAccount.account_holder_name || '',
          accountNumberEnding: bankAccount.account_number_ending || '',
        };
        pendingPayment = await hasPendingPayment(this.data.mandateId);
      } catch (err: any) {
        // 404s can happen on dev as we don't use real mandate IDs
        if (!(config.dev && err.response && err.response.status === 404)) {
          throw err;
        }
      }
    }

    return {
      hasPendingPayment: pendingPayment,
      ...(paymentSource && { paymentSource }),
    };
  }

  /**
   * Cancels active subscription and optionally cancels mandate
   * @param keepMandate - Whether to keep mandate for future use
   */
  async cancelContribution(keepMandate: boolean): Promise<void> {
    log.info('Cancel subscription for ' + this.contact.id, { keepMandate });

    const subscriptionId = this.data.subscriptionId;
    const mandateId = this.data.mandateId;

    this.data.nextAmount = null;
    this.data.subscriptionId = null;
    if (!keepMandate) {
      this.data.mandateId = null;
    }
    // Save before cancelling to stop the webhook triggering a cancelled email
    await this.updateData();

    if (mandateId && !keepMandate) {
      await gocardless.mandates.cancel(mandateId);
    }
    if (subscriptionId) {
      await gocardless.subscriptions.cancel(subscriptionId);
    }
  }

  /**
   * Updates customer information with GoCardless
   * @param updates - Contact fields to update
   */
  async updateContact(updates: Partial<Contact>): Promise<void> {
    if (
      (updates.email || updates.firstname || updates.lastname) &&
      this.data.customerId
    ) {
      log.info('Update contact in GoCardless');
      await gocardless.customers.update(this.data.customerId, {
        ...(updates.email && { email: updates.email }),
        ...(updates.firstname && { given_name: updates.firstname }),
        ...(updates.lastname && { family_name: updates.lastname }),
      });
    }
  }

  /**
   * Permanently deletes customer data from GoCardless
   */
  async permanentlyDeleteContact(): Promise<void> {
    if (this.data.mandateId) {
      await gocardless.mandates.cancel(this.data.mandateId);
    }
    if (this.data.customerId) {
      await gocardless.customers.remove(this.data.customerId);
    }
  }

  /**
   * Updates payment method using completed payment flow
   * @param completedPaymentFlow - The completed flow with new mandate
   */
  private async updatePaymentMethod(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<void> {
    log.info('Update payment source for ' + this.contact.id, {
      userId: this.contact.id,
      data: this.data,
      completedPaymentFlow,
    });

    const hadSubscription = !!this.data.subscriptionId;
    const mandateId = this.data.mandateId;

    this.data.subscriptionId = null;
    this.data.customerId = completedPaymentFlow.customerId;
    this.data.mandateId = completedPaymentFlow.mandateId;

    // Save before cancelling to stop the webhook triggering a cancelled email
    await this.updateData();

    if (mandateId) {
      // This will also cancel the subscription
      await gocardless.mandates.cancel(mandateId);
    }

    if (
      hadSubscription &&
      this.contact.contributionPeriod &&
      this.contact.contributionMonthlyAmount
    ) {
      await this.processUpdateContribution({
        monthlyAmount: this.contact.contributionMonthlyAmount,
        period: this.contact.contributionPeriod,
        payFee: !!this.data.payFee,
      });
    }
  }

  /**
   * Checks if contribution changes are allowed based on mandate status
   * @param useExistingMandate - Whether to use existing mandate
   * @param form - New payment details
   * @returns Promise resolving to boolean indicating if changes are allowed
   *
   * @deprecated
   * Only used internally to avoid changing GoCardless processing behaviour.
   * Should be removed and actual logic implemented in canProcessPaymentFlow and
   * canUpdateContribution
   */
  private async canChangeContribution(
    useExistingMandate: boolean,
    form: UpdateContributionForm
  ): Promise<boolean> {
    // No payment method available
    if (useExistingMandate && !this.data.mandateId) {
      return false;
    }

    // Can always change contribution if there is no subscription
    if (!this.data.subscriptionId) {
      return true;
    }

    // Monthly contributors can update their contribution amount even if they have
    // pending payments, but they can't always change their period or mandate as this can
    // result in double charging
    return (
      (useExistingMandate &&
        this.contact.contributionPeriod === 'monthly' &&
        form.period === 'monthly') ||
      !(this.data.mandateId && (await hasPendingPayment(this.data.mandateId)))
    );
  }
}

/** @deprecated Use named import GCProvider instead */
export default GCProvider;
