import {
  ContributionPeriod,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
  PaymentType,
  StripePaymentMethod,
} from '@beabee/beabee-common';

import { differenceInMonths } from 'date-fns';
import Stripe from 'stripe';

import config from '#config/config';
import { currentLocale } from '#locale';
import { log as mainLogger } from '#logging';
import { PaymentFlow } from '#models';
import { type Payment } from '#models/Payment';
import OptionsService from '#services/OptionsService';
import {
  PaymentFlowFormCreateOneTimePayment,
  UpdateContributionForm,
} from '#type/index';
import { getChargeableAmount } from '#utils/payment';

// Stripe webhook events that we handle
export const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.deleted',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.created',
  'invoice.updated',
  'invoice.paid',
  'invoice.payment_failed',
  'payment_method.detached',
] as const;

const log = mainLogger.child({ app: 'stripe-utils' });

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.version,
  typescript: true,
});

export function getSalesTaxRateObject(
  type: 'recurring' | 'one-time'
): string[] {
  const taxRateId = OptionsService.getText(`stripe-tax-rate-${type}-id`);
  return taxRateId ? [taxRateId] : [];
}

/**
 * Update the sales tax rate, disabling the previous one if needed
 *
 * @param type The type of tax rate to update
 * @param percentage The new sales tax rate percentage or null to disable
 */
export async function updateSalesTaxRate(
  type: 'recurring' | 'one-time',
  percentage: number | null
): Promise<void> {
  const id = OptionsService.getText(`stripe-tax-rate-${type}-id`);

  if (id) {
    const taxRate = await stripe.taxRates.retrieve(id);
    // Tax rate is already set to the right percentage, do nothing
    if (taxRate.percentage === percentage) {
      log.info(`Sales tax rate for ${type} is already ${percentage}%`);
      return;
    }

    log.info(`Disabling current ${type} sales tax rate`);
    await stripe.taxRates.update(id, { active: false });
  }

  if (percentage === null) {
    await OptionsService.set(`stripe-tax-rate-${type}-id`, '');
  } else {
    log.info(`Setting new ${type} sales tax rate to ${percentage}%`);
    const taxRate = await stripe.taxRates.create({
      percentage: percentage,
      active: true,
      inclusive: true,
      display_name: currentLocale().paymentLabels.taxRateDisplayName,
    });

    await OptionsService.set(`stripe-tax-rate-${type}-id`, taxRate.id);
  }
}

/**
 * Convert a payment form and method into a Stripe price data object.
 *
 * @param form The contribution form
 * @param paymentMethod The payment method
 * @returns A Stripe price data object
 */
export function getPriceData(
  form: UpdateContributionForm,
  paymentMethod: PaymentMethod
): Stripe.SubscriptionCreateParams.Item.PriceData {
  return {
    currency: config.currencyCode,
    product: OptionsService.getText('stripe-membership-product-id'),
    recurring: {
      interval: form.period === ContributionPeriod.Monthly ? 'month' : 'year',
    },
    unit_amount: getChargeableAmount(form, paymentMethod),
  };
}

/**
 * Calculate the proration amount and time for a subscription item.
 *
 * @param subscription The subscription to prorate
 * @param subscriptionItem The subscription item to prorate ti
 * @returns The amount to prorate and the time to prorate at
 */
async function calculateProrationParams(
  subscription: Stripe.Subscription,
  subscriptionItem: Stripe.InvoiceRetrieveUpcomingParams.SubscriptionItem
) {
  // Prorate by whole months
  const monthsLeft = Math.max(
    0,
    differenceInMonths(subscription.current_period_end * 1000, new Date())
  );
  // Calculate exact number of seconds to remove (rather than just "one month")
  // as this aligns with Stripe's calculations
  const prorationTime = Math.floor(
    subscription.current_period_end -
      (subscription.current_period_end - subscription.current_period_start) *
        (monthsLeft / 12)
  );

  const invoice = await stripe.invoices.retrieveUpcoming({
    subscription: subscription.id,
    subscription_items: [subscriptionItem],
    subscription_proration_date: prorationTime,
  });

  const prorationAmount = invoice.lines.data
    .filter((item) => item.proration)
    .reduce((total, item) => total + item.amount, 0);

  return {
    // Only prorate amounts above 100 cents. This aligns with GoCardless's minimum
    // amount and is much simpler than trying to calculate the minimum payment per
    // payment method
    prorationAmount:
      prorationAmount >= 0 && prorationAmount < 100 ? 0 : prorationAmount,
    prorationTime,
  };
}

/**
 * Create a new subscription in Stripe, optionally starting at a specific date.
 *
 * @param customerId The Stripe customer ID
 * @param form The payment form data
 * @param paymentMethod The payment method to use
 * @param renewalDate The date the subscription should start
 * @returns The new Stripe subscription
 */
export async function createSubscription(
  customerId: string,
  form: UpdateContributionForm,
  paymentMethod: PaymentMethod,
  renewalDate?: Date
): Promise<Stripe.Subscription> {
  log.info('Creating subscription on ' + customerId, {
    form,
    renewalDate,
  });
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price_data: getPriceData(form, paymentMethod) }],
    off_session: true,
    default_tax_rates: getSalesTaxRateObject('recurring'),
    expand: ['latest_invoice'],
    payment_behavior: 'default_incomplete',
    ...(renewalDate &&
      renewalDate > new Date() && {
        billing_cycle_anchor: Math.floor(+renewalDate / 1000),
        proration_behavior: 'none',
      }),
  });
}

/**
 * Update a subscription with a new payment method or amount.
 *
 * @param subscriptionId
 * @param form
 * @param paymentMethod
 * @returns
 */
export async function updateSubscription(
  subscriptionId: string,
  form: UpdateContributionForm,
  paymentMethod: PaymentMethod
): Promise<{ subscription: Stripe.Subscription; startNow: boolean }> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['schedule'],
  });
  const newSubscriptionItem = {
    id: subscription.items.data[0].id,
    price_data: getPriceData(form, paymentMethod),
  };

  const { prorationAmount, prorationTime } = await calculateProrationParams(
    subscription,
    newSubscriptionItem
  );

  log.info('Preparing update subscription for ' + subscription.id, {
    renewalDate: new Date(subscription.current_period_end * 1000),
    prorationDate: new Date(prorationTime * 1000),
    prorationAmount,
    form,
  });

  // Clear any previous schedule
  const oldSchedule =
    subscription.schedule as Stripe.SubscriptionSchedule | null;
  if (
    oldSchedule?.status === 'active' ||
    oldSchedule?.status === 'not_started'
  ) {
    log.info(`Releasing schedule ${oldSchedule.id} for ${subscription.id}`);
    await stripe.subscriptionSchedules.release(oldSchedule.id);
  }

  const startNow =
    prorationAmount === 0 || (prorationAmount > 0 && !!form.prorate);

  if (startNow) {
    const params: Stripe.SubscriptionUpdateParams = {
      items: [newSubscriptionItem],
      ...(prorationAmount > 0
        ? {
            proration_behavior: 'always_invoice',
            proration_date: prorationTime,
          }
        : {
            proration_behavior: 'none',
            // Force it to change at the start of the next period, this is
            // important when changing from monthly to annual as otherwise
            // Stripe starts the new billing cycle immediately
            trial_end: subscription.current_period_end,
          }),
    };

    // Start new contribution immediately (monthly or prorated annuals)
    log.info(`Updating subscription for ${subscription.id}`);
    await stripe.subscriptions.update(subscriptionId, params);
  } else {
    // Schedule the change for the next period
    log.info(`Creating new schedule for ${subscription.id}`);
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: subscription.id,
    });

    await stripe.subscriptionSchedules.update(schedule.id, {
      phases: [
        {
          start_date: schedule.phases[0].start_date,
          end_date: schedule.phases[0].end_date,
          items: [{ price: schedule.phases[0].items[0].price as string }],
        },
        {
          start_date: schedule.phases[0].end_date,
          items: [{ price_data: newSubscriptionItem.price_data }],
        },
      ],
    });
  }

  return { subscription, startNow };
}

/**
 * Delete a subscription in Stripe, ignoring missing subscription errors.
 *
 * @param subscriptionId The subscription ID
 */
export async function deleteSubscription(
  subscriptionId: string
): Promise<void> {
  try {
    await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    // Ignore resource missing errors, the subscription might have been already removed
    if (
      !(error instanceof Stripe.errors.StripeInvalidRequestError) ||
      error.code !== 'resource_missing'
    ) {
      throw error;
    }
  }
}

/**
 * Create a one-time payment
 *
 * @param customerId The ID of the customer
 * @param token The confirmation token
 * @param form The payment form
 * @param paymentMethod The payment method
 */
export async function chargeOneTimePayment(
  customerId: string,
  flow: PaymentFlow<
    PaymentMethod.StripeCard,
    PaymentFlowFormCreateOneTimePayment
  >
): Promise<void> {
  log.info('Creating one-time payment on ' + customerId);

  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'charge_automatically',
    auto_advance: false,
    currency: config.currencyCode,
    metadata: {
      'beabee-invoice-type': 'one-time-payment',
    },
    default_tax_rates: getSalesTaxRateObject('one-time'),
  });

  await stripe.invoiceItems.create({
    customer: customerId,
    invoice: invoice.id,
    amount: getChargeableAmount(flow.form, flow.method),
    description: 'One-time payment',
  });

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

  const paymentIntent = finalizedInvoice.payment_intent as string | null;
  if (!paymentIntent) {
    throw new Error();
  }

  await stripe.paymentIntents.confirm(paymentIntent, {
    confirmation_token: flow.params.token,
  });
}

export function isOneTimePaymentInvoice(
  invoice: Stripe.Invoice,
  detach?: true
): boolean {
  const type = invoice.metadata?.['beabee-invoice-type'] || '';
  return detach
    ? type === 'one-time-payment-detach-mandate'
    : type.startsWith('one-time-payment');
}

/**
 * Convert a Stripe payment type to a payment method, mirrors
 * paymentMethodToStripeType.
 *
 * @param type The Stripe payment type
 * @returns The payment method
 */
export function stripeTypeToPaymentMethod(
  type: StripePaymentMethod
): PaymentMethod {
  switch (type) {
    case 'card':
      return PaymentMethod.StripeCard;
    case 'sepa_debit':
      return PaymentMethod.StripeSEPA;
    case 'bacs_debit':
      return PaymentMethod.StripeBACS;
    case 'paypal':
      return PaymentMethod.StripePayPal;
    case 'ideal':
      return PaymentMethod.StripeIdeal;
    default:
      throw new Error('Unexpected Stripe payment type');
  }
}

/**
 * Retrieve the payment source for a given Stripe mandate
 *
 * @param mandateId
 * @returns The payment source
 */
export async function manadateToSource(
  mandateId: string
): Promise<PaymentSource | undefined> {
  const method = await stripe.paymentMethods.retrieve(mandateId);

  if (method.type === 'card' && method.card) {
    return {
      method: PaymentMethod.StripeCard,
      isLink: false,
      last4: method.card.last4,
      expiryMonth: method.card.exp_month,
      expiryYear: method.card.exp_year,
    };
  } else if (method.type === 'sepa_debit' && method.sepa_debit) {
    return {
      method: PaymentMethod.StripeSEPA,
      country: method.sepa_debit.country || '',
      bankCode: method.sepa_debit.bank_code || '',
      branchCode: method.sepa_debit.branch_code || '',
      last4: method.sepa_debit.last4 || '',
    };
  } else if (method.type === 'bacs_debit' && method.bacs_debit) {
    return {
      method: PaymentMethod.StripeBACS,
      sortCode: method.bacs_debit.sort_code || '',
      last4: method.bacs_debit.last4 || '',
    };
  } else if (method.type === 'paypal' && method.paypal) {
    return {
      method: PaymentMethod.StripePayPal,
      payerEmail: method.paypal.payer_email || '',
      payerId: method.paypal.payer_id || '',
    };
  } else if (method.type === 'link' && method.link) {
    return {
      method: PaymentMethod.StripeCard,
      isLink: true,
      email: method.link.email || '',
    };
  }
}

export function convertInvoiceToPayment(
  invoice: Stripe.Invoice
): Pick<
  Payment,
  'amount' | 'chargeDate' | 'description' | 'subscriptionId' | 'status' | 'type'
> {
  return {
    amount: invoice.total / 100,
    chargeDate: new Date(invoice.created * 1000),
    description: invoice.description || '',
    subscriptionId: invoice.subscription as string | null,
    status: invoice.status
      ? convertStatus(invoice.status)
      : PaymentStatus.Draft,
    type: getInvoiceType(invoice),
  };
}

/**
 * Convert a Stripe invoice status to a payment status.
 *
 * @param status The Stripe invoice status
 * @returns The payment status
 */
export function convertStatus(status: Stripe.Invoice.Status): PaymentStatus {
  switch (status) {
    case 'draft':
      return PaymentStatus.Draft;

    case 'open':
      return PaymentStatus.Pending;

    case 'paid':
      return PaymentStatus.Successful;

    case 'void':
      return PaymentStatus.Cancelled;

    case 'uncollectible':
      return PaymentStatus.Failed;
  }
}

/**
 * Get the payment type from a Stripe invoice.
 * @param invoice The Stripe invoice
 * @returns The payment type
 */
export function getInvoiceType(invoice: Stripe.Invoice): PaymentType {
  if (invoice.subscription) {
    switch (invoice.billing_reason) {
      case 'subscription':
      case 'subscription_create':
      case 'subscription_cycle':
        return PaymentType.Recurring;
      case 'subscription_update':
        return PaymentType.Prorated;
      default:
        return PaymentType.Unknown;
    }
  } else {
    return PaymentType.OneTime;
  }
}

export { Stripe };
