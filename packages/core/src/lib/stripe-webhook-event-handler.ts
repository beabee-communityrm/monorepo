import { PaymentStatus } from '@beabee/beabee-common';

import { add } from 'date-fns';
import type Stripe from 'stripe';

import config from '../config/config';
import { getRepository } from '../database';
import { log as mainLogger } from '../logging';
import { ContactContribution, Payment } from '../models';
import ContactsService from '../services/ContactsService';
import EmailService from '../services/EmailService';
import GiftService from '../services/GiftService';
import PaymentService from '../services/PaymentService';
import {
  convertInvoiceToPayment,
  getSalesTaxRateObject,
  isOneTimePaymentInvoice,
  stripe,
} from './stripe';

const log = mainLogger.child({ app: 'stripe-webhook-handler' });

/**
 * Handles all incoming Stripe webhook events and processes them according to their type.
 * This class contains methods for managing subscriptions, payments, and customer data
 * in response to Stripe events.
 */
export class StripeWebhookEventHandler {
  /**
   * Main entry point for processing Stripe webhook events
   * Routes the event to the appropriate handler based on its type
   * @param event The incoming Stripe webhook event
   */
  static async handleEvent(event: Stripe.Event): Promise<void> {
    log.info(`Processing webhook ${event.id} ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.deleted':
        await this.handleCustomerDeleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleCustomerSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleCustomerSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.created':
        await this.handleInvoiceCreated(event.data.object);
        break;
      case 'invoice.updated':
        await this.handleInvoiceUpdated(event.data.object);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      case 'payment_method.detached':
        await this.handlePaymentMethodDetached(event.data.object);
        break;
    }
  }

  /**
   * Processes a completed checkout session, typically used for gift flows
   * @param session The completed Stripe checkout session
   */
  private static async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    await GiftService.completeGiftFlow(session.id);
  }

  /**
   * Handles customer deletion by removing customer references from our system
   * @param customer The deleted Stripe customer
   */
  private static async handleCustomerDeleted(
    customer: Stripe.Customer
  ): Promise<void> {
    const contribution = await PaymentService.getContributionBy(
      'customerId',
      customer.id
    );
    if (contribution) {
      log.info('Delete customer from ' + customer.id, {
        customerId: customer.id,
        contactId: contribution.contact.id,
      });
      await PaymentService.updateData(contribution.contact, {
        customerId: null,
      });
    }
  }

  /**
   * Handles subscription updates, particularly focusing on failed subscription starts
   * If a subscription becomes incomplete_expired, the membership is revoked
   * @param subscription The updated Stripe subscription
   */
  private static async handleCustomerSubscriptionUpdated(
    subscription: Stripe.Subscription
  ): Promise<void> {
    if (subscription.status === 'incomplete_expired') {
      const contribution = await PaymentService.getContributionBy(
        'subscriptionId',
        subscription.id
      );
      if (contribution) {
        log.info(
          `Subscription ${subscription.id} never started, revoking membership from ${contribution.contact.id}`
        );
        await ContactsService.revokeContactRole(contribution.contact, 'member');
        await PaymentService.updateData(contribution.contact, {
          subscriptionId: null,
        });
        await EmailService.sendTemplateToContact(
          'contribution-didnt-start',
          contribution.contact
        );
      }
    }
  }

  /**
   * Processes subscription cancellations and triggers appropriate contact updates
   * @param subscription The cancelled Stripe subscription
   */
  private static async handleCustomerSubscriptionDeleted(
    subscription: Stripe.Subscription
  ): Promise<void> {
    log.info('Cancel subscription ' + subscription.id);
    const contribution = await PaymentService.getContributionBy(
      'subscriptionId',
      subscription.id
    );
    if (contribution) {
      await ContactsService.cancelContactContribution(
        contribution.contact,
        'cancelled-contribution'
      );
    }
  }

  /**
   * Create a new payment record when an invoice is created and check if the tax
   * rates need updating, as the system-wide tax rate might have been changed since
   * the subscription was created.
   *
   * @param invoice The newly created Stripe invoice
   */
  private static async handleInvoiceCreated(
    invoice: Stripe.Invoice
  ): Promise<void> {
    // Create the new payment record
    const payment = await this.handleInvoiceUpdated(invoice);

    // Only invoices from subscriptions can have out-of-date tax rates because
    // the invoices are generated asynchronously after the subscription is created
    if (!payment?.subscriptionId) return;

    // Can't update non-draft invoices. This should never be a problem as only a
    // subscription's initial invoice is created in a finalised state, and the initial
    // invoice will have the current system tax rate applied.
    // https://docs.stripe.com/billing/invoices/subscription#update-first-invoice
    if (invoice.status !== 'draft') return;

    const taxRateObj = getSalesTaxRateObject('recurring');
    const invoiceTaxRateObj = invoice.default_tax_rates.map((rate) => rate.id);

    // If tax rates match then there's nothing to do
    if (this.taxRatesMatch(invoiceTaxRateObj, taxRateObj)) return;

    await this.updateInvoiceAndSubscriptionTaxRates(invoice, taxRateObj);
  }

  /**
   * Updates or creates a payment record in our system based on invoice updates
   *
   * @param invoice The updated Stripe invoice
   * @returns The updated or created payment record
   */
  public static async handleInvoiceUpdated(
    invoice: Stripe.Invoice
  ): Promise<Payment | undefined> {
    const payment = await this.findOrCreatePaymentForInvoice(invoice);
    if (!payment) return;

    if (
      isOneTimePaymentInvoice(invoice) &&
      (invoice.status === 'paid' ||
        invoice.status === 'void' ||
        invoice.status === 'uncollectible') &&
      invoice.default_payment_method
    ) {
      log.info('Detaching payment method for one-time invoice ' + invoice.id);
      await stripe.paymentMethods.detach(
        invoice.default_payment_method as string
      );
    }

    log.info('Updating payment for invoice ' + invoice.id);
    Object.assign(payment, convertInvoiceToPayment(invoice));

    return await getRepository(Payment).save(payment);
  }

  /**
   * Handle updating the contact's membership when an invoice is paid. Stripe
   * also sends an 'invoice.updated' event when an invoice is paid, so that
   * handler will take care of updating payment records (including for
   * non-subscription payments).
   *
   * @param invoice The paid Stripe invoice
   */
  public static async handleInvoicePaid(
    invoice: Stripe.Invoice
  ): Promise<void> {
    const contribution = await this.getContributionFromInvoice(invoice);
    if (!contribution) return;

    log.info(`Invoice ${invoice.id} was paid`);

    if (invoice.subscription) {
      // Unlikely, just log for now
      if (invoice.lines.has_more) {
        log.error(`Invoice ${invoice.id} has too many lines`);
        return;
      }

      // Stripe docs say the subscription will always be the last line in the invoice
      const line = invoice.lines.data.slice(-1)[0];
      if (line.subscription !== invoice.subscription) {
        log.error(
          'Expected subscription to be last line on invoice' + invoice.id
        );
        return;
      }

      await this.updateContributionAfterPayment(contribution, line);
    } else if (isOneTimePaymentInvoice(invoice)) {
      await EmailService.sendTemplateToContact(
        'one-time-donation',
        contribution.contact,
        { amount: invoice.total / 100 }
      );
    }
  }

  /**
   * When there are no more payment attempts for an invoice, mark it as
   * uncollectible so it doesn't remain open indefinitely.
   *
   * @param invoice The Stripe invoice
   */
  private static async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice
  ): Promise<void> {
    // For now only handle one-time payment invoices
    // TODO: Consider handling subscription invoices too
    if (!isOneTimePaymentInvoice(invoice)) {
      return;
    }

    // At the moment just marks as uncollectible straight away and therefore
    // cancels any retry schedule. This could change in the future if it is
    // supported
    if (invoice.status !== 'uncollectible') {
      log.info(`Marking invoice ${invoice.id} as uncollectible `);
      await stripe.invoices.markUncollectible(invoice.id);

      const contribution = await this.getContributionFromInvoice(invoice);
      if (contribution) {
        await EmailService.sendTemplateToContact(
          'one-time-donation-failed',
          contribution.contact
        );
      }
    }
  }

  /**
   * Removes mandate references when a payment method is detached
   *
   * @param paymentMethod The detached Stripe payment method
   */
  private static async handlePaymentMethodDetached(
    paymentMethod: Stripe.PaymentMethod
  ): Promise<void> {
    const contribution = await PaymentService.getContributionBy(
      'mandateId',
      paymentMethod.id
    );
    if (contribution) {
      log.info('Detached payment method ' + paymentMethod.id, {
        mandateId: paymentMethod.id,
        contactId: contribution.contact.id,
      });
      await PaymentService.updateData(contribution.contact, {
        mandateId: null,
      });
    }
  }

  /**
   * Retrieves the associated contribution for an invoice based on
   * the invoice customer ID
   *
   * @param invoice The Stripe invoice
   * @returns The associated contact contribution or null if not found
   */
  private static async getContributionFromInvoice(
    invoice: Stripe.Invoice
  ): Promise<ContactContribution | null> {
    if (!invoice.customer) {
      log.info('Ignoring invoice without customer ' + invoice.id);
      return null;
    }

    const contribution = await PaymentService.getContributionBy(
      'customerId',
      invoice.customer as string
    );
    if (!contribution) {
      log.info('Ignoring invoice with unknown customer ' + invoice.id);
    }
    return contribution;
  }

  /**
   * Finds or creates a payment record for an invoice
   * @param invoice The Stripe invoice
   * @returns The found or created payment record
   */
  private static async findOrCreatePaymentForInvoice(
    invoice: Stripe.Invoice
  ): Promise<Payment | undefined> {
    const payment = await getRepository(Payment).findOneBy({ id: invoice.id });
    if (payment) return payment;

    const contribution = await this.getContributionFromInvoice(invoice);
    if (!contribution) return;

    const newPayment = new Payment();
    newPayment.id = invoice.id;
    newPayment.contact = contribution.contact;

    log.info(
      `Creating payment for ${contribution.contact.id} with invoice ${invoice.id}`
    );
    return newPayment;
  }

  /**
   * Compares two arrays of tax rate IDs for equality
   * @param invoiceRates Array of tax rate IDs from the invoice
   * @param taxRates Array of tax rate IDs to compare against
   * @returns True if the tax rates match
   */
  private static taxRatesMatch(
    invoiceRates: string[],
    taxRates: string[]
  ): boolean {
    return (
      invoiceRates.length === taxRates.length &&
      invoiceRates.every((rate) => taxRates.includes(rate))
    );
  }

  /**
   * Updates tax rates for both invoice and associated subscription
   * @param invoice The Stripe invoice to update
   * @param taxRateObj Array of tax rate IDs to apply
   */
  private static async updateInvoiceAndSubscriptionTaxRates(
    invoice: Stripe.Invoice,
    taxRateObj: string[]
  ): Promise<void> {
    const updateTaxRateObj = taxRateObj.length > 0 ? taxRateObj : '';

    log.info('Updating tax rate on invoice ' + invoice.id, {
      oldTaxRate: invoice.default_tax_rates.map((rate) => rate.id),
      newTaxRate: updateTaxRateObj,
    });

    await stripe.invoices.update(invoice.id, {
      default_tax_rates: updateTaxRateObj,
    });

    // Update the subscription if it exists
    if (invoice.subscription) {
      await this.updateSubscriptionTaxRates(
        invoice.subscription as string,
        updateTaxRateObj
      );
    }
  }

  /**
   * Updates tax rates for a subscription
   * @param subscriptionId The ID of the Stripe subscription
   * @param taxRates The tax rates to apply
   */
  private static async updateSubscriptionTaxRates(
    subscriptionId: string,
    taxRates: string[] | ''
  ): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (
      subscription.status !== 'canceled' &&
      subscription.status !== 'incomplete_expired'
    ) {
      log.info(
        `Updating tax rate on subscription ${subscriptionId} with status ${subscription.status}`
      );
      await stripe.subscriptions.update(subscriptionId, {
        default_tax_rates: taxRates,
      });
    }
  }

  /**
   * Extends the contact's membership based on a successful contribution
   * payment. If the contact has a next contribution amount and this payment
   * matches it, then "activate" the next amount by updating the monthly
   * contribution.
   *
   * @param contribution The contact contribution record
   * @param line The invoice line item containing period and amount information
   */
  private static async updateContributionAfterPayment(
    contribution: ContactContribution,
    line: Stripe.InvoiceLineItem
  ): Promise<void> {
    await ContactsService.extendContactRole(
      contribution.contact,
      'member',
      add(new Date(line.period.end * 1000), config.gracePeriod)
    );

    if (line.amount === contribution.nextAmount?.chargeable) {
      await ContactsService.updateContact(contribution.contact, {
        contributionMonthlyAmount: contribution.nextAmount.monthly,
      });
      await PaymentService.updateData(contribution.contact, {
        nextAmount: null,
      });
    }
  }
}
