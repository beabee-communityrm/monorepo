import {
  ContributionForm,
  ContributionType,
  PaymentForm,
  PaymentSource,
} from '@beabee/beabee-common';

import { add } from 'date-fns';
import Stripe from 'stripe';

import config from '#config/config';
import { NoPaymentMethod, PaymentFailed } from '#errors/index';
import {
  chargeOneTimePayment,
  createSubscription,
  deleteSubscription,
  ensureCustomerAndAttachPayment,
  manadateToSource,
  stripe,
  updateSubscription,
} from '#lib/stripe';
import { log as mainLogger } from '#logging';
import { Contact } from '#models/index';
import {
  CompletedPaymentFlow,
  ContributionInfo,
  UpdateContributionResult,
} from '#type/index';
import { calcRenewalDate, getChargeableAmount } from '#utils/payment';

import { PaymentProvider } from './PaymentProvider';

const log = mainLogger.child({ app: 'stripe-payment-provider' });

export class StripeProvider extends PaymentProvider {
  /**
   * Checks if a contribution can be changed. With Stripe this is always
   * possible as long as the user has a valid mandate.
   *
   * @param useExistingMandate Whether an existing mandate will be used
   * @returns Whether the contribution can be changed
   */
  async canChangeContribution(useExistingMandate: boolean): Promise<boolean> {
    return !useExistingMandate || !!this.data.mandateId;
  }

  /**
   * Retrieves information about the contact's current payment source
   *
   * @returns Information about the current contribution payment source
   */
  async getContributionInfo(): Promise<Partial<ContributionInfo>> {
    let paymentSource: PaymentSource | undefined;
    try {
      paymentSource = this.data.mandateId
        ? await manadateToSource(this.data.mandateId)
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
      // TODO hasPendingPayment: await this.hasPendingPayment(),
      ...(paymentSource && { paymentSource }),
    };
  }

  /**
   * Cancels an active Stripe subscription and the payment method unless it
   * should be specifically kept for future use.
   *
   * @param keepMandate  Whether to keep payment mandate for future use
   */
  async cancelContribution(keepMandate: boolean): Promise<void> {
    if (this.data.mandateId && !keepMandate) {
      await stripe.paymentMethods.detach(this.data.mandateId);
      this.data.mandateId = null;
    }
    if (this.data.subscriptionId) {
      await deleteSubscription(this.data.subscriptionId);
      this.data.subscriptionId = null;
    }
    this.data.nextAmount = null;

    await this.updateData();
  }

  /**
   * Update the payment method to the one provided in the completed flow.
   * This will also create a Stripe customer if one doesn't exist and detach
   * any existing payment methods. The customer object will be created or updated
   * with information from the completed flow (e.g. name etc.)
   *
   * @param flow The completed payment flow
   */
  async updatePaymentMethod(flow: CompletedPaymentFlow): Promise<void> {
    const paymentMethod = await stripe.paymentMethods.retrieve(flow.mandateId);
    const address = paymentMethod.billing_details.address;

    this.data.customerId = await ensureCustomerAndAttachPayment(
      this.contact,
      this.data.customerId,
      flow.mandateId,
      flow.joinForm.vatNumber
    );

    log.info('Update customer details for ' + this.data.customerId);
    await stripe.customers.update(this.data.customerId, {
      invoice_settings: {
        default_payment_method: flow.mandateId,
      },
      address: address
        ? {
            line1: address.line1 || '',
            ...(address.city && { city: address.city }),
            ...(address.country && { country: address.country }),
            ...(address.line2 && { line2: address.line2 }),
            ...(address.postal_code && { postal_code: address.postal_code }),
            ...(address.state && { state: address.state }),
          }
        : null,
    });

    if (this.data.mandateId) {
      log.info('Detach old payment method ' + this.data.mandateId);
      await stripe.paymentMethods.detach(this.data.mandateId);
    }

    this.data.mandateId = flow.mandateId;

    await this.updateData();
  }

  /**
   * Update a contacts contribution. This will create or update the subscription
   * as needed.
   *
   * @param form The contribution form
   * @returns Information about the updated contribution
   */
  async updateContribution(
    form: ContributionForm
  ): Promise<UpdateContributionResult> {
    if (!this.data.customerId || !this.data.mandateId) {
      throw new NoPaymentMethod();
    }

    // Manual contributors don't have a real subscription yet, create one on
    // their previous amount so Stripe can automatically handle any proration
    if (
      this.contact.membership?.isActive &&
      this.contact.contributionType === ContributionType.Manual
    ) {
      log.info('Creating new subscription for manual contributor');
      const newSubscription = await createSubscription(
        this.data.customerId,
        {
          ...form,
          monthlyAmount: this.contact.contributionMonthlyAmount || 0,
        },
        this.method,
        calcRenewalDate(this.contact)
      );
      // Set this for the updateOrCreateSubscription call below
      this.data.subscriptionId = newSubscription.id;
    }

    const { subscription, startNow } =
      await this.updateOrCreateSubscription(form);

    this.data.subscriptionId = subscription.id;
    this.data.payFee = form.payFee;
    this.data.nextAmount = startNow
      ? null
      : {
          chargeable: getChargeableAmount(form, this.method),
          monthly: form.monthlyAmount,
        };

    await this.updateData();

    return {
      startNow,
      expiryDate: add(
        new Date(subscription.current_period_end * 1000),
        config.gracePeriod
      ),
    };
  }

  /**
   * Update or create a Stripe subscription object. If the contact has an active
   * subscription but inactive membership, the existing subscription will be
   * cancelled and a new one created.
   *
   * @param form The contribution form
   * @returns Information about the updated subscription
   */
  private async updateOrCreateSubscription(
    form: ContributionForm
  ): Promise<{ subscription: Stripe.Subscription; startNow: boolean }> {
    if (this.data.subscriptionId && this.contact.membership?.isActive) {
      log.info('Update subscription ' + this.data.subscriptionId);
      return await updateSubscription(
        this.data.subscriptionId,
        form,
        this.method
      );
    } else {
      // Cancel any existing (failing) subscriptions
      await this.cancelContribution(true);

      log.info('Create subscription');
      const subscription = await createSubscription(
        this.data.customerId!, // customerId is asserted in updateContribution
        form,
        this.method,
        calcRenewalDate(this.contact)
      );
      return { subscription, startNow: true };
    }
  }

  /**
   * Updates a contact's basic information in Stripe
   *
   * @param updates The contact updates
   */
  async updateContact(updates: Partial<Contact>): Promise<void> {
    if (
      (updates.email || updates.firstname || updates.lastname) &&
      this.data.customerId
    ) {
      log.info('Update contact');
      await stripe.customers.update(this.data.customerId, {
        ...(updates.email && { email: updates.email }),
        ...((updates.firstname || updates.lastname) && {
          name: `${updates.firstname} ${updates.lastname}`,
        }),
      });
    }
  }

  /**
   * Create a one-time payment using the payment method from the completed flow
   *
   * @param flow The completed payment flow
   * @param form The payment form
   */
  async createOneTimePayment(flow: CompletedPaymentFlow): Promise<void> {
    log.info(
      'Create one-time payment of amount ' + flow.joinForm.monthlyAmount
    );

    this.data.customerId = await ensureCustomerAndAttachPayment(
      this.contact,
      this.data.customerId,
      flow.mandateId,
      flow.joinForm.vatNumber
    );
    await this.updateData();

    try {
      await chargeOneTimePayment(
        this.data.customerId,
        flow.mandateId,
        flow.joinForm,
        flow.joinForm.paymentMethod
      );
    } catch (err) {
      if (err instanceof Stripe.errors.StripeCardError) {
        throw new PaymentFailed(err.decline_code);
      } else {
        throw err;
      }
    }
  }

  /**
   * Permanently deletes customer data from Stripe. Stripe handles
   * cancelling any active subscriptions when the customer is deleted.
   */
  async permanentlyDeleteContact(): Promise<void> {
    if (this.data.customerId) {
      await stripe.customers.del(this.data.customerId);
    }
  }

  static async fetchInvoiceUrl(paymentId: string): Promise<string | null> {
    const invoice = await stripe.invoices.retrieve(paymentId);
    return invoice.invoice_pdf || null;
  }
}

/** @deprecated Use stripeProvider instead */
export default StripeProvider;
