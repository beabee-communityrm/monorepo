import {
  ContributionForm,
  ContributionPeriod,
  PaymentForm,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
  PaymentType,
} from '@beabee/beabee-common';

import { differenceInMonths } from 'date-fns';
import Stripe from 'stripe';

import config from '#config/config';
import currentLocale from '#locale';
import { log as mainLogger } from '#logging';
import OptionsService from '#services/OptionsService';
import { getChargeableAmount } from '#utils/payment';

const log = mainLogger.child({ app: 'stripe-utils' });

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-04-10',
  typescript: true,
});

export function getSalesTaxRateObject(
  type: 'recurring' | 'one-time'
): string[] {
  const taxRateId = OptionsService.getText(`tax-rate-${type}-stripe-id`);
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
  const id = OptionsService.getText(`tax-rate-${type}-stripe-id`);

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
    await OptionsService.set(`tax-rate-${type}-stripe-id`, '');
  } else {
    log.info(`Setting new ${type} sales tax rate to ${percentage}%`);
    const taxRate = await stripe.taxRates.create({
      percentage: percentage,
      active: true,
      inclusive: true,
      display_name: currentLocale().taxRate.invoiceName,
    });

    await OptionsService.set(`tax-rate-${type}-stripe-id`, taxRate.id);
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
  form: ContributionForm,
  paymentMethod: PaymentMethod
): Stripe.SubscriptionCreateParams.Item.PriceData {
  return {
    currency: config.currencyCode,
    product: config.stripe.membershipProductId,
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
    prorationAmount: prorationAmount < 100 ? 0 : prorationAmount,
    prorationTime,
  };
}

export const getCreateSubscriptionParams = (
  customerId: string,
  form: ContributionForm,
  paymentMethod: PaymentMethod,
  renewalDate?: Date
): Stripe.SubscriptionCreateParams => {
  return {
    customer: customerId,
    items: [{ price_data: getPriceData(form, paymentMethod) }],
    off_session: true,
    ...(renewalDate &&
      renewalDate > new Date() && {
        billing_cycle_anchor: Math.floor(+renewalDate / 1000),
        proration_behavior: 'none',
      }),
    default_tax_rates: getSalesTaxRateObject('recurring'),
  };
};

/**
 * Create a new subscription in Stripe, optionally starting at a specific date.
 *
 * @param customerId The Stripe customer ID
 * @param paymentForm The payment form data
 * @param paymentMethod The payment method to use
 * @param renewalDate The date the subscription should start
 * @returns The new Stripe subscription
 */
export async function createSubscription(
  customerId: string,
  form: ContributionForm,
  paymentMethod: PaymentMethod,
  renewalDate?: Date
): Promise<Stripe.Subscription> {
  log.info('Creating subscription on ' + customerId, {
    form,
    renewalDate,
  });
  return await stripe.subscriptions.create(
    getCreateSubscriptionParams(customerId, form, paymentMethod, renewalDate)
  );
}

/**
 * Update a subscription with a new payment method or amount.
 *
 * @param subscriptionId
 * @param paymentForm
 * @param paymentMethod
 * @returns
 */
export async function updateSubscription(
  subscriptionId: string,
  form: ContributionForm,
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

  const startNow = prorationAmount === 0 || form.prorate;

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
 * Create a customer in Stripe if needed and attach the payment mandate to them.
 *
 * @param contact The contact information
 * @param customerId The existing customer ID or null to create a new one
 * @param mandateId The payment mandate ID
 * @param vatNumber The VAT number to attach to the customer
 * @returns The Stripe customer ID
 */
export async function ensureCustomerAndAttachPayment(
  contact: { email: string; firstname: string; lastname: string },
  customerId: string | null,
  mandateId: string,
  vatNumber?: string | null
): Promise<string> {
  if (!customerId) {
    log.info('Create new customer for ' + contact.email);
    const customer = await stripe.customers.create({
      email: contact.email,
      name: `${contact.firstname} ${contact.lastname}`,
      ...(vatNumber && { tax_id_data: [{ type: 'eu_vat', value: vatNumber }] }),
    });
    customerId = customer.id;
  }

  log.info('Attach payment method ' + mandateId + ' to customer ' + customerId);
  await stripe.paymentMethods.attach(mandateId, {
    customer: customerId,
  });

  return customerId;
}

/**
 * Create a one-time payment
 *
 * @param customerId The ID of the customer
 * @param mandateId The ID of the payment mandate
 * @param form The payment form
 * @param paymentMethod The payment method
 */
export async function chargeOneTimePayment(
  customerId: string,
  mandateId: string,
  form: PaymentForm,
  paymentMethod: PaymentMethod
): Promise<void> {
  log.info('Creating one-time payment on ' + customerId);

  const invoice = await stripe.invoices.create({
    customer: customerId,
    default_payment_method: mandateId,
    collection_method: 'charge_automatically',
    auto_advance: true,
    currency: config.currencyCode,
    metadata: {
      'beabee-invoice-type': 'one-time-payment-detach-mandate',
    },
    default_tax_rates: getSalesTaxRateObject('one-time'),
  });

  await stripe.invoiceItems.create({
    customer: customerId,
    invoice: invoice.id,
    amount: getChargeableAmount(form, paymentMethod),
    description: 'One-time payment',
  });

  await stripe.invoices.pay(invoice.id);
}

export function isOneTimePaymentInvoice(invoice: Stripe.Invoice): boolean {
  return (
    invoice.metadata?.['beabee-invoice-type'] ===
    'one-time-payment-detach-mandate'
  );
}

/**
 * Convert a payment method to a Stripe payment type.
 *
 * @param method The payment method
 * @returns The Stripe payment type
 */
export function paymentMethodToStripeType(
  method: PaymentMethod
): Stripe.PaymentMethod.Type {
  switch (method) {
    case PaymentMethod.StripeCard:
      return 'card';
    case PaymentMethod.StripeSEPA:
      return 'sepa_debit';
    case PaymentMethod.StripeBACS:
      return 'bacs_debit';
    case PaymentMethod.StripePayPal:
      return 'paypal';
    case PaymentMethod.StripeIdeal:
      return 'ideal';
    case PaymentMethod.GoCardlessDirectDebit:
      return 'bacs_debit';
  }
}

/**
 * Convert a Stripe payment type to a payment method, mirrors
 * paymentMethodToStripeType.
 *
 * @param type The Stripe payment type
 * @returns The payment method
 */
export function stripeTypeToPaymentMethod(
  type: Stripe.PaymentMethod.Type
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
