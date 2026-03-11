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
    return await this.withDataUpdate(async () => {
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
    });
  }

  /**
   * Checks if a contribution can be changed. With Stripe this is always
   * possible as it handles all the necessary steps internally.
   * @returns Whether the contribution can be changed
   */
  async canUpdateContribution(): Promise<boolean> {
    return !!(this.data.customerId && this.data.mandateId);
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
    return await this.withDataUpdate(async () => {
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

        this.data.subscriptionId = newSubscription.id;
      }

      if (this.contact.membership?.isActive) {
        log.info('Update subscription ' + this.data.subscriptionId);
        const { subscription, startNow } = await updateSubscription(
          this.data.subscriptionId,
          form,
          this.method
        );
        return await this.handleSubscriptionResult(
          subscription,
          form,
          startNow
        );
      } else {
        // Cancel any existing (failing) subscriptions
        await this.cancelContribution(true);

        log.info('Create subscription');
        const subscription = await createSubscription(
          this.data.customerId,
          form,
          this.method,
          calcRenewalDate(this.contact)
        );
        return await this.handleSubscriptionResult(subscription, form, true);
      }
    });
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
    await this.withDataUpdate(async () => {
      if (this.data.mandateId && !keepMandate) {
        await stripe.paymentMethods.detach(this.data.mandateId);
        this.data.mandateId = null;
      }
      if (this.data.subscriptionId) {
        await deleteSubscription(this.data.subscriptionId);
        this.data.subscriptionId = null;
      }
      this.data.nextAmount = null;
    });
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
    await this.withDataUpdate(async () => {
      if (this.data.customerId) {
        await stripe.customers.del(this.data.customerId);
        // Clear local customer reference after deletion
        this.data.customerId = null;
      }
    });
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
    const customerId = await this.ensureCustomerForFlow(flow);

    // TODO: handle requires_action
    const intent = await stripe.setupIntents.create({
      customer: customerId,
      confirm: true,
      confirmation_token: flow.params.token,
      expand: ['latest_attempt'],
    });

    await this.processConfirmedIntent(intent, flow);
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

    const customerId = await this.ensureCustomerForFlow(flow);

    try {
      // TODO: handle requires_action
      await chargeOneTimePayment(customerId, flow);
    } catch (err) {
      if (err instanceof Stripe.errors.StripeCardError) {
        throw new PaymentFailed(err.decline_code);
      } else {
        throw err;
      }
    }
  }

  /**
   * Start a contribution for the given flow
   * @param flow The completed flow to start the contribution for
   * @returns The result of the update
   */
  private async startContribution(
    flow: CompletedPaymentFlow<
      PaymentFlowParamsStripe,
      PaymentFlowFormStartContribution
    >
  ): Promise<UpdateContributionResult> {
    log.info('Start contribution for completed flow', flow);

    if (this.data.subscriptionId) {
      throw new CantUpdateContribution();
    }

    const customerId = await this.ensureCustomerForFlow(flow);

    const subscription = await createSubscription(
      customerId,
      flow.form,
      this.method,
      calcRenewalDate(this.contact)
    );

    // Use the confirmation token on the payment intent
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
    const paymentIntent = latestInvoice?.payment_intent as string | null;

    if (!paymentIntent) {
      throw new NoPaymentMethod();
    }

    // TODO: handle requires_action
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
      paymentIntent,
      { confirmation_token: flow.params.token }
    );

    await this.processConfirmedIntent(confirmedPaymentIntent, flow);

    return await this.handleSubscriptionResult(subscription, flow.form, true);
  }

  /**
   * Ensure a customer exists and is attached to the payment flow.
   * This is a common operation used by multiple payment flow methods.
   *
   * @param flow The payment flow
   * @returns The customer ID
   */
  private async ensureCustomerForFlow(
    flow: CompletedPaymentFlow<PaymentFlowParamsStripe>
  ): Promise<string> {
    let customerId = this.data.customerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: this.contact.email,
        name: `${this.contact.firstname} ${this.contact.lastname}`,
        ...(flow.params.vatNumber && {
          tax_id_data: [{ type: 'eu_vat', value: flow.params.vatNumber }],
        }),
      });
      customerId = customer.id;
    }

    this.data.customerId = customerId;
    return customerId;
  }

  /**
   * Process the result of a confirmed Stripe intent (setup or payment).
   * Handles iDEAL to SEPA conversion, customer updates, and old payment method cleanup.
   *
   * @param intent The confirmed Stripe intent (setup or payment)
   * @param flow The payment flow containing method information
   */
  private async processConfirmedIntent(
    intent: Stripe.SetupIntent | Stripe.PaymentIntent,
    flow: CompletedPaymentFlow<PaymentFlowParamsStripe>
  ): Promise<void> {
    // Save old mandate to remove afterwards
    const oldMandateId = this.data.mandateId;

    const paymentMethod = intent.payment_method as Stripe.PaymentMethod | null;
    if (!paymentMethod) {
      throw new NoPaymentMethod();
    }

    // Handle iDEAL to SEPA conversion
    if (
      flow.params.paymentMethod === PaymentMethod.StripeIdeal &&
      // TODO: fix this properly
      'latest_attempt' in intent
    ) {
      const latestAttempt = intent.latest_attempt as Stripe.SetupAttempt | null;
      const newMandateId = latestAttempt?.payment_method_details?.ideal
        ?.generated_sepa_debit as string | null;

      if (!newMandateId) {
        throw new NoPaymentMethod();
      }

      this.data.mandateId = newMandateId;
      this.data.method = PaymentMethod.StripeSEPA;
    } else {
      this.data.mandateId = paymentMethod.id;
    }

    // Update customer with new payment method and address
    const address = paymentMethod.billing_details.address;
    await stripe.customers.update(this.data.customerId!, {
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

    // Detach old payment method if it exists
    if (oldMandateId) {
      log.info('Detach old payment method ' + oldMandateId);
      await stripe.paymentMethods.detach(oldMandateId);
    }
  }

  /**
   * Handle the result of a subscription creation by updating the contact data
   * and returning the appropriate result object.
   *
   * @param subscription The created Stripe subscription
   * @param form The contribution form
   * @param startNow Whether the contribution should start immediately
   * @returns The update contribution result
   */
  private async handleSubscriptionResult(
    subscription: Stripe.Subscription,
    form: UpdateContributionForm,
    startNow: boolean
  ): Promise<UpdateContributionResult> {
    this.data.subscriptionId = subscription.id;
    this.data.payFee = form.payFee;

    // Calculate nextAmount if not starting immediately
    this.data.nextAmount = !startNow
      ? {
          chargeable: getChargeableAmount(form, this.method),
          monthly: form.monthlyAmount,
        }
      : null;

    return {
      form,
      startNow,
      expiryDate: add(
        new Date(subscription.current_period_end * 1000),
        config.gracePeriod
      ),
    };
  }

  static async fetchInvoiceUrl(paymentId: string): Promise<string | null> {
    const invoice = await stripe.invoices.retrieve(paymentId);
    return invoice.invoice_pdf || null;
  }
}

/** @deprecated Use stripeProvider instead */
export default StripeProvider;
