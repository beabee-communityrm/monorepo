import { PaymentStatus } from '@beabee/beabee-common';

import { add } from 'date-fns';
import type Stripe from 'stripe';

import config from '../config/config';
import { getRepository } from '../database';
import { log as mainLogger } from '../logging';
import { ContactContribution, Payment } from '../models';
import ContactsService from '../services/ContactsService';
import { emailService } from '../services/EmailService';
import GiftService from '../services/GiftService';
import PaymentService from '../services/PaymentService';
import { convertStatus, getSalesTaxRateObject, stripe } from './stripe';

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
        await emailService.sendTemplate('contribution-didnt-start', {
          contact: contribution.contact,
        });
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
   * Handles newly created invoices by ensuring correct tax rates are applied
   * Updates both the invoice and associated subscription if necessary
   * @param invoice The newly created Stripe invoice
   */
  private static async handleInvoiceCreated(
    invoice: Stripe.Invoice
  ): Promise<void> {
    const payment = await this.handleInvoiceUpdated(invoice);

    // Only update the tax rate on invoices that we know about
    if (!payment) return;

    // Can't update non-draft invoices. This should never be a problem as only a
    // subscription's initial invoice is created in a finalised state
    // https://docs.stripe.com/billing/invoices/subscription#update-first-invoice
    if (invoice.status !== 'draft') return;

    const taxRateObj = getSalesTaxRateObject();
    const invoiceTaxRateObj = invoice.default_tax_rates.map((rate) => rate.id);

    // If tax rates match then there's nothing to do
    if (this.taxRatesMatch(invoiceTaxRateObj, taxRateObj)) return;

    await this.updateInvoiceAndSubscriptionTaxRates(invoice, taxRateObj);
  }

  /**
   * Updates or creates a payment record in our system based on invoice updates
   * @param invoice The updated Stripe invoice
   * @returns The updated or created payment record
   */
  public static async handleInvoiceUpdated(
    invoice: Stripe.Invoice
  ): Promise<Payment | undefined> {
    const payment = await this.findOrCreatePayment(invoice);
    if (payment) {
      log.info('Updating payment for invoice ' + invoice.id);
      payment.status = invoice.status
        ? convertStatus(invoice.status)
        : PaymentStatus.Draft;
      payment.description = invoice.description || '';
      payment.amount = invoice.total / 100;
      payment.chargeDate = new Date(invoice.created * 1000);
      return await getRepository(Payment).save(payment);
    }
  }

  /**
   * Processes paid invoices by extending membership periods and updating contribution amounts
   * @param invoice The paid Stripe invoice
   */
  public static async handleInvoicePaid(
    invoice: Stripe.Invoice
  ): Promise<void> {
    const contribution = await this.getContributionFromInvoice(invoice);
    if (!contribution || !invoice.subscription) return;

    log.info(`Invoice ${invoice.id} was paid`);

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

    await this.handleSuccessfulPayment(contribution, line);
  }

  /**
   * Handles detached payment methods by removing references from our system
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
   * Retrieves the associated contribution for an invoice
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
  private static async findOrCreatePayment(
    invoice: Stripe.Invoice
  ): Promise<Payment | undefined> {
    const payment = await getRepository(Payment).findOneBy({ id: invoice.id });
    if (payment) return payment;

    const contribution = await this.getContributionFromInvoice(invoice);
    if (!contribution) return;

    const newPayment = new Payment();
    newPayment.id = invoice.id;
    newPayment.contact = contribution.contact;
    newPayment.subscriptionId = invoice.subscription as string | null;

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
   * Processes a successful payment by extending membership and updating contribution amounts
   * @param contribution The contact contribution record
   * @param line The invoice line item containing period and amount information
   */
  private static async handleSuccessfulPayment(
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
