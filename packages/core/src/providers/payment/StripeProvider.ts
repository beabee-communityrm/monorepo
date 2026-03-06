import {
  ContributionType,
  PaymentFlowParamsStripe,
  PaymentMethod,
  PaymentSource,
} from '@beabee/beabee-common';

import { add } from 'date-fns';
import Stripe from 'stripe';

import config from '#config/config';
import {
  CantUpdateContribution,
  NoPaymentMethod,
  PaymentFailed,
} from '#errors/index';
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
  PaymentFlowFormCreateOneTimePayment,
  PaymentFlowFormStartContribution,
  UpdateContributionForm,
  UpdateContributionResult,
} from '#type/index';
import { calcRenewalDate, getChargeableAmount } from '#utils/payment';

import { PaymentProvider } from './PaymentProvider';

const log = mainLogger.child({ app: 'stripe-payment-provider' });

export class StripeProvider extends PaymentProvider {
  /**
   * Check if the payment flow can be processed. With Stripe this is always
   * possible as it handles all the necessary steps internally.
   * @returns Whether the payment flow can be processed
   */
  async canProcessPaymentFlow(): Promise<boolean> {
    return true;
  }

  async processPaymentFlow(
    flow: CompletedPaymentFlow<PaymentFlowParamsStripe>
  ): Promise<UpdateContributionResult | undefined> {
    switch (flow.form.action) {
      case 'create-one-time-payment':
        await this.createOneTimePayment({ ...flow, form: flow.form });
        return;
      case 'update-payment-method':
        await this.updatePaymentMethod(flow);
        return;
      case 'start-contribution':
        return await this.startContribution({ ...flow, form: flow.form });
      default:
        throw new Error('Unknown payment flow action');
    }
  }

  /**
   * Checks if a contribution can be changed. With Stripe this is always
   * possible as it handles all the necessary steps internally.
   * @returns Whether the contribution can be changed
   */
  async canUpdateContribution(): Promise<boolean> {
    return true;
  }

  /**
   * Update a contacts contribution. This will update the subscription as
   * needed.
   *
   * @param form The contribution form
   * @returns Information about the updated contribution
   */
  async processUpdateContribution(
    form: UpdateContributionForm
  ): Promise<UpdateContributionResult> {
    if (!this.data.customerId || !this.data.subscriptionId) {
      throw new CantUpdateContribution();
    }

    log.info('Update subscription ' + this.data.subscriptionId);

    // Manual contributors don't have a real subscription yet, create one on
    // their previous amount so Stripe can automatically handle any proration
    if (
      this.contact.membership?.isActive &&
      this.contact.contributionType === ContributionType.Manual
    ) {
      log.info('Creating new subscription for manual contributor');
      const newSubscription = await createSubscription(
        this.data.customerId,
        form,
        this.method,
        calcRenewalDate(this.contact)
      );

      // Will be read by updateOrCreateSubscription
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
      form,
      startNow,
      expiryDate: add(
        new Date(subscription.current_period_end * 1000),
        config.gracePeriod
      ),
    };
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
   * Permanently deletes customer data from Stripe. Stripe handles
   * cancelling any active subscriptions when the customer is deleted.
   */
  async permanentlyDeleteContact(): Promise<void> {
    if (this.data.customerId) {
      await stripe.customers.del(this.data.customerId);
    }
  }

  /**
   * Update the payment method to the one provided in the completed flow.
   * This will also create a Stripe customer if one doesn't exist and detach
   * any existing payment methods. The customer object will be created or updated
   * with information from the completed flow (e.g. name etc.)
   *
   * @param flow The completed payment flow
   */
  private async updatePaymentMethod(
    flow: CompletedPaymentFlow<PaymentFlowParamsStripe>
  ): Promise<void> {
    this.data.customerId = await ensureCustomerAndAttachPayment(
      this.contact,
      this.data.customerId,
      flow.params.vatNumber
    );

    // TODO: handle requires_action
    const intent = await stripe.setupIntents.create({
      customer: this.data.customerId,
      confirm: true,
      confirmation_token: flow.params.token,
      expand: ['latest_attempt'],
    });

    const paymentMethod = intent.payment_method as Stripe.PaymentMethod | null;
    if (!paymentMethod) {
      throw new NoPaymentMethod();
    }

    const oldMandateId = this.data.mandateId;

    this.data.mandateId = paymentMethod.id;

    if (flow.params.paymentMethod === PaymentMethod.StripeIdeal) {
      const latestAttempt = intent.latest_attempt as Stripe.SetupAttempt | null;
      const newMandateId = latestAttempt?.payment_method_details?.ideal
        ?.generated_sepa_debit as string | null;

      if (!newMandateId) {
        throw new NoPaymentMethod();
      }

      this.data.mandateId = newMandateId;
      this.data.method = PaymentMethod.StripeSEPA;
    }

    const address = paymentMethod.billing_details.address;

    log.info('Update customer details for ' + this.data.customerId);
    await stripe.customers.update(this.data.customerId, {
      invoice_settings: {
        default_payment_method: this.data.mandateId,
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

    if (oldMandateId) {
      log.info('Detach old payment method ' + oldMandateId);
      await stripe.paymentMethods.detach(oldMandateId);
    }

    await this.updateData();
  }

  /**
   * Create a one-time payment using the payment method from the completed flow
   *
   * @param flow The completed payment flow
   * @param form The payment form
   */
  private async createOneTimePayment(
    flow: CompletedPaymentFlow<
      PaymentFlowParamsStripe,
      PaymentFlowFormCreateOneTimePayment
    >
  ): Promise<void> {
    log.info('Create one-time payment of amount ' + flow.form.amount);

    this.data.customerId = await ensureCustomerAndAttachPayment(
      this.contact,
      this.data.customerId,
      flow.params.vatNumber
    );
    await this.updateData();

    try {
      // TODO: handle requires_action
      await chargeOneTimePayment(
        this.data.customerId,
        flow.params.token,
        flow.form,
        flow.params.paymentMethod
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
   *
   * @param flow
   */
  private async startContribution(
    flow: CompletedPaymentFlow<
      PaymentFlowParamsStripe,
      PaymentFlowFormStartContribution
    >
  ): Promise<UpdateContributionResult> {
    this.data.customerId = await ensureCustomerAndAttachPayment(
      this.contact,
      this.data.customerId,
      flow.params.vatNumber
    );

    log.info('Create subscription');
    const subscription = await createSubscription(
      this.data.customerId,
      flow.form,
      this.method,
      calcRenewalDate(this.contact)
    );

    // Use the confirmation token on the payment intent
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    // TODO: handle requires_action
    await stripe.paymentIntents.confirm(paymentIntent.id, {
      confirmation_token: flow.params.token,
    });

    this.data.subscriptionId = subscription.id;
    this.data.payFee = flow.form.payFee;
    this.data.nextAmount = null;

    await this.updateData();

    return {
      form: flow.form,
      startNow: true,
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
    form: UpdateContributionForm
  ): Promise<{ subscription: Stripe.Subscription; startNow: boolean }> {
    if (!this.data.customerId) {
      throw new NoPaymentMethod();
    }

    if (this.data.subscriptionId && this.contact.membership?.isActive) {
      log.info('Update subscription ' + this.data.subscriptionId);
      return await updateSubscription(
        this.data.subscriptionId,
        form,
        this.method
      );
    } else {
      // Cancel any existing (failing) subscriptions
      // TODO: think about previous mandates
      await this.cancelContribution(true);

      log.info('Create subscription');
      const subscription = await createSubscription(
        this.data.customerId,
        form,
        this.method,
        calcRenewalDate(this.contact)
      );
      return { subscription, startNow: true };
    }
  }

  static async fetchInvoiceUrl(paymentId: string): Promise<string | null> {
    const invoice = await stripe.invoices.retrieve(paymentId);
    return invoice.invoice_pdf || null;
  }
}

/** @deprecated Use stripeProvider instead */
export default StripeProvider;
