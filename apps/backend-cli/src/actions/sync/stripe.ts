import { getRepository } from '@beabee/core/database';
import {
  Stripe,
  convertInvoiceToPayment,
  stripe,
} from '@beabee/core/lib/stripe';
import { StripeWebhookEventHandler } from '@beabee/core/lib/stripe-webhook-event-handler';
import { log as mainLogger } from '@beabee/core/logging';
import { Contact, ContactContribution, Payment } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services';

import { In, Like } from 'typeorm';

import { SyncStripeArgs } from '../../types/sync.js';

const log = mainLogger.child({ app: 'sync-stripe' });

/**
 * Helper function to determine if an error is a Stripe "resource missing" error
 */
function isResourceMissingError(e: unknown): boolean {
  return (
    e instanceof Stripe.errors.StripeError && e.code === 'resource_missing'
  );
}

/**
 * Helper function to fetch all invoices for a given customer
 *
 * @param customerId The Stripe customer ID
 */
async function* fetchInvoices(customerId: string) {
  let hasMore = true;
  while (hasMore) {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100,
    });
    hasMore = invoices.has_more;
    yield* invoices.data;
  }
}

/**
 * Sync our subscription data with the live Stripe data
 *
 * @param subscriptionId The Stripe subscription ID to check
 * @param contact The contact associated with the subscription
 * @param dryRun Whether to perform a dry run (no changes applied)
 * @returns Any updates to be applied to the contribution
 */
async function syncSubscription(
  subscriptionId: string,
  contact: Contact,
  dryRun: boolean
): Promise<{ subscriptionId: null; cancelledAt?: Date } | undefined> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.status === 'canceled') {
      log.info(`    🚫 Cancelling subscription ${subscriptionId}`);

      return {
        cancelledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : new Date(),
        subscriptionId: null,
      };
    } else if (subscription.status === 'incomplete_expired') {
      log.info(`    🗑️ Removing incomplete subscription ${subscriptionId}`);

      if (!dryRun) {
        await contactsService.revokeContactRole(contact, 'member');
      }

      return { subscriptionId: null };
    }
  } catch (e) {
    if (isResourceMissingError(e)) {
      log.info(`    🗑️ Removing missing subscription ${subscriptionId}`);
      return { subscriptionId: null };
    } else {
      throw e;
    }
  }
}

/**
 * Sync our payment method data with the live Stripe data
 *
 * @param mandateId The Stripe payment method ID
 * @returns Any updates to be applied to the contribution
 */
async function syncPaymentMethod(
  mandateId: string
): Promise<{ mandateId: null } | undefined> {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(mandateId);
    if (!paymentMethod.customer) {
      log.info(`    🔌 Detaching payment method ${mandateId}`);
      return { mandateId: null };
    }
  } catch (e) {
    if (isResourceMissingError(e)) {
      log.info(`    🗑️ Removing missing mandate ${mandateId}`);
      return { mandateId: null };
    } else {
      throw e;
    }
  }
}

/**
 * Sync our customer data with the live Stripe data
 *
 * @param customerId The Stripe customer Id
 * @returns Any updates to be applied to the contribution
 */
async function syncCustomer(
  customerId: string
): Promise<
  { customerId: null; mandateId: null; subscriptionId: null } | undefined
> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      log.info(`    🗑️ Removing deleted customer ${customerId}`);
      return { customerId: null, mandateId: null, subscriptionId: null };
    }
  } catch (e) {
    if (isResourceMissingError(e)) {
      log.info(`    🗑️ Removing missing customer ${customerId}`);
      return { customerId: null, mandateId: null, subscriptionId: null };
    } else {
      throw e;
    }
  }
}

/**
 * Sync our payment data with the live Stripe data, adding missing payments or
 * updating existing ones as necessary. If the invoice has been paid it will
 * also ensure their membership role is extended appropriately.
 *
 * @param customerId The Stripe customer ID
 * @param payments The existing payments for this contact
 * @param dryRun Whether to perform a dry run (no changes applied)
 */
async function syncPayments(
  customerId: string,
  payments: Payment[],
  dryRun: boolean
): Promise<void> {
  for await (const invoice of fetchInvoices(customerId)) {
    log.info(`    🧾 Processing invoice ${invoice.id}`);
    const payment = payments.find((p) => p.id === invoice.id);
    const newPayment = convertInvoiceToPayment(invoice);

    if (payment) {
      // Date type needs different equality check
      if (payment.chargeDate.getTime() !== newPayment.chargeDate.getTime()) {
        log.info(
          `      🔄 Updating field chargeDate: ${payment.chargeDate} -> ${newPayment.chargeDate}`
        );
      }

      for (const key of [
        'amount',
        'description',
        'subscriptionId',
        'status',
        'type',
      ] as const) {
        if (payment[key] !== newPayment[key]) {
          log.info(
            `      🔄 Updating field ${key}: ${payment[key]} -> ${newPayment[key]}`
          );
        }
      }
    } else {
      log.info(`      ➕ Creating payment for invoice ${invoice.id}`);
    }

    if (!dryRun) {
      // Upsert the payment
      await StripeWebhookEventHandler.handleInvoiceUpdated(invoice);

      // If the invoice is paid, we need to handle that too to ensure
      // membership roles are updated
      if (invoice.paid) {
        await StripeWebhookEventHandler.handleInvoicePaid(invoice, false);
      }
    }
  }
}

/**
 * Process a single contribution, syncing its subscription, mandate,
 * customer and payments as necessary.
 *
 * @param contribution The contribution to process
 * @param dryRun Whether to perform a dry run (no changes applied)
 */
async function processContribution(
  contribution: ContactContribution,
  argv: SyncStripeArgs
) {
  log.info(`👤 Syncing ${contribution.contact.email}`);

  const updates: Partial<ContactContribution> = {};

  if (contribution.subscriptionId && argv.fix.includes('subscriptions')) {
    log.info(`  📋 Syncing subscription ${contribution.subscriptionId}`);
    const subscriptionUpdates = await syncSubscription(
      contribution.subscriptionId,
      contribution.contact,
      argv.dryRun
    );
    Object.assign(updates, subscriptionUpdates);
  }

  if (contribution.mandateId && argv.fix.includes('mandates')) {
    log.info(`  💳 Syncing mandate ${contribution.mandateId}`);
    const mandateUpdates = await syncPaymentMethod(contribution.mandateId);
    Object.assign(updates, mandateUpdates);
  }

  if (contribution.customerId) {
    if (argv.fix.includes('customers')) {
      log.info(`  👤 Syncing customer ${contribution.customerId}`);
      const customerUpdates = await syncCustomer(contribution.customerId);
      Object.assign(updates, customerUpdates);
    }

    if (argv.fix.includes('payments')) {
      log.info(`  💰 Syncing payments for customer ${contribution.customerId}`);
      const payments = await getRepository(Payment).findBy({
        contactId: contribution.contact.id,
      });
      try {
        await syncPayments(contribution.customerId, payments, argv.dryRun);
      } catch (e) {
        // Ignore missing customer errors here as they are handled above
        if (!isResourceMissingError(e)) {
          throw e;
        }
      }
    }
  }

  // Apply updates
  if (Object.keys(updates).length > 0) {
    log.info(
      `  🔄 Updating contribution`,
      { ...contribution, contact: undefined },
      updates
    );

    if (!argv.dryRun) {
      await getRepository(ContactContribution).update(
        contribution.contact.id,
        updates
      );
    }
  }
}

/**
 * Synchronise our contribution data with Stripe, ensuring subscriptions,
 * mandates and customers are all up to date, and extending or revoking
 * contact membership roles as appropriate.
 *
 * @param dryRun Whether to perform a dry run (no changes applied)
 */
export const syncStripe = async (argv: SyncStripeArgs): Promise<void> => {
  await runApp(async () => {
    log.info('📡 Loading Stripe contributions...');
    const contributions = await getRepository(ContactContribution).find({
      where: {
        customerId: Like('cus_%'),
        ...(argv.contactIds && { contactId: In(argv.contactIds) }),
      },
      relations: { contact: true },
    });

    log.info(`📊 Processing ${contributions.length} Stripe contributions`);

    if (argv.dryRun) {
      log.info('🔍 DRY RUN - No changes will actually be made');
    }

    for (const contribution of contributions) {
      await processContribution(contribution, argv);
    }

    log.info('✅ Stripe sync completed successfully!');
  });
};
