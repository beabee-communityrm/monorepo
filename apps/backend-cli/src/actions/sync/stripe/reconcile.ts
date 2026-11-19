import { ActivityEventType, PaymentStatus } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import {
  Stripe,
  convertInvoiceToPayment,
  stripe,
} from '@beabee/core/lib/stripe';
import { log as mainLogger } from '@beabee/core/logging';
import { Contact, ContactContribution, Payment } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { activityService, contactsService } from '@beabee/core/services';

import { setTimeout } from 'node:timers/promises';
import { In, Like } from 'typeorm';

import type {
  StripeInvoicePayment,
  StripePaymentReconciliation,
  StripeResources,
  SyncStripeReconcileArgs,
} from '../../../types/sync.js';
import {
  classifyInvoicePayments,
  countStatusChanges,
  printPaymentMismatch,
} from '../../../utils/stripe-reconcile.js';

const log = mainLogger.child({ app: 'sync-stripe-reconcile' });

const MAX_RATE_LIMIT_RETRIES = 5;

/**
 * Helper function to determine if an error is a Stripe "resource missing" error
 */
function isResourceMissingError(e: unknown): boolean {
  return (
    e instanceof Stripe.errors.StripeError && e.code === 'resource_missing'
  );
}

/**
 * Runs a Stripe request, waiting and trying again while it is rate limited
 *
 * @param request The Stripe request
 */
async function retryRateLimited<T>(request: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request();
    } catch (e) {
      if (
        !(e instanceof Stripe.errors.StripeRateLimitError) ||
        attempt === MAX_RATE_LIMIT_RETRIES
      ) {
        throw e;
      }
      // Exponential backoff with jitter, as Stripe asks for
      await setTimeout(2 ** attempt * 1000 + Math.random() * 1000);
    }
  }
}

/**
 * Helper function to fetch a Stripe list, a page at a time
 *
 * Pages by cursor instead of using the SDK's auto-pagination, which does not
 * retry a rate limited request: one rate limit would end the listing and it
 * would have to start again from the first page.
 *
 * @param list Requests the page of the list at the given cursor
 */
async function* fetchPages<T extends { id: string }>(
  list: (page: Stripe.PaginationParams) => Promise<Stripe.ApiList<T>>
): AsyncGenerator<T[]> {
  let startingAfter: string | undefined;
  do {
    const page = await retryRateLimited(() =>
      list({
        limit: 100,
        ...(startingAfter && { starting_after: startingAfter }),
      })
    );
    yield page.data;
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);
}

/**
 * Fetch a whole Stripe list and keep the objects with the given ids. The
 * Stripe account can be shared with other integrations, so only objects
 * linked to our own data are ours.
 *
 * @param name The name of the objects, for the log
 * @param ids The ids of the objects to keep
 * @param list Requests the page of the list at the given cursor
 * @returns The kept objects by id
 */
async function fetchKnown<T extends { id: string }>(
  name: string,
  ids: Set<string | null>,
  list: (page: Stripe.PaginationParams) => Promise<Stripe.ApiList<T>>
): Promise<Map<string, T>> {
  log.info(`📡 Fetching Stripe ${name}...`);
  const known = new Map<string, T>();
  let fetched = 0;
  for await (const page of fetchPages(list)) {
    for (const item of page) {
      if (ids.has(item.id)) {
        known.set(item.id, item);
      }
    }
    fetched += page.length;
    log.info(`  • Fetched ${fetched} ${name}`);
  }
  return known;
}

/**
 * Converts a Stripe invoice to the payment it should be stored as
 *
 * @param invoice The Stripe invoice
 */
function toInvoicePayment(invoice: Stripe.Invoice): StripeInvoicePayment {
  return {
    id: invoice.id,
    customerId:
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id || null,
    data: convertInvoiceToPayment(invoice),
  };
}

/**
 * Sync our subscription data with the live Stripe data
 *
 * @param subscriptionId The Stripe subscription ID to check
 * @param contact The contact associated with the subscription
 * @param dryRun Whether to perform a dry run (no changes applied)
 * @param listed The subscription if it was already fetched
 * @returns Any updates to be applied to the contribution
 */
async function syncSubscription(
  subscriptionId: string,
  contact: Contact,
  dryRun: boolean,
  listed: Stripe.Subscription | undefined
): Promise<{ subscriptionId: null; cancelledAt?: Date } | undefined> {
  try {
    const subscription =
      listed || (await stripe.subscriptions.retrieve(subscriptionId));
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
 * @param customer The customer if it was already fetched
 * @returns Any updates to be applied to the contribution
 */
async function syncPaymentMethod(
  mandateId: string,
  customer: Stripe.Customer | undefined
): Promise<{ mandateId: null } | undefined> {
  // A customer's default payment method is attached to that customer
  if (customer?.invoice_settings.default_payment_method === mandateId) {
    return;
  }

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
 * @param listed The customer if it was already fetched
 * @returns Any updates to be applied to the contribution
 */
async function syncCustomer(
  customerId: string,
  listed: Stripe.Customer | undefined
): Promise<
  { customerId: null; mandateId: null; subscriptionId: null } | undefined
> {
  try {
    const customer = listed || (await stripe.customers.retrieve(customerId));
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
 * Compare our payments with the live Stripe invoices. Checks the invoices
 * created in the reconciliation window, plus the invoices of all payments we
 * hold as unfinished, as those can change long after they were created.
 *
 * @param contributions The Stripe contributions to reconcile payments for
 * @param argv The command line arguments
 * @returns The payment reconciliation data
 */
async function fetchPayments(
  contributions: ContactContribution[],
  argv: SyncStripeReconcileArgs
): Promise<StripePaymentReconciliation> {
  const data: StripePaymentReconciliation = {
    mismatches: [],
    missing: [],
    orphans: [],
  };

  const contactIdByCustomerId = new Map<string, string>();
  for (const contribution of contributions) {
    if (contribution.customerId) {
      contactIdByCustomerId.set(
        contribution.customerId,
        contribution.contact.id
      );
    }
  }

  const window: Stripe.InvoiceListParams =
    argv.since || argv.until
      ? {
          created: {
            ...(argv.since && { gte: Math.floor(argv.since.getTime() / 1000) }),
            ...(argv.until && { lte: Math.floor(argv.until.getTime() / 1000) }),
          },
        }
      : {};
  // Listing the whole account takes far fewer requests than listing each
  // customer, so only list by customer when limited to specific contacts
  const filters: Stripe.InvoiceListParams[] = argv.contactIds
    ? [...contactIdByCustomerId.keys()].map((customer) => ({
        ...window,
        customer,
      }))
    : [window];

  log.info('📡 Fetching Stripe invoices...');
  const checkedIds = new Set<string>();
  for (const filter of filters) {
    try {
      for await (const invoices of fetchPages((page) =>
        stripe.invoices.list({ ...filter, ...page })
      )) {
        const payments = await getRepository(Payment).findBy({
          id: In(invoices.map((invoice) => invoice.id)),
        });
        const { mismatches, missing } = classifyInvoicePayments(
          invoices.map(toInvoicePayment),
          payments,
          contactIdByCustomerId
        );
        data.mismatches.push(...mismatches);
        data.missing.push(...missing);
        for (const invoice of invoices) {
          checkedIds.add(invoice.id);
        }
        log.info(`  • Fetched ${checkedIds.size} invoices`);
      }
    } catch (e) {
      // A missing customer is handled by the customers fix
      if (!isResourceMissingError(e)) {
        throw e;
      }
    }
  }

  log.info('📡 Fetching Stripe invoices of unfinished payments...');
  const unfinishedPayments = await getRepository(Payment).findBy({
    id: Like('in_%'),
    status: In([PaymentStatus.Draft, PaymentStatus.Pending]),
    ...(argv.contactIds && { contactId: In(argv.contactIds) }),
  });
  for (const payment of unfinishedPayments) {
    if (checkedIds.has(payment.id)) continue;

    try {
      const invoice = await retryRateLimited(() =>
        stripe.invoices.retrieve(payment.id)
      );
      const { mismatches } = classifyInvoicePayments(
        [toInvoicePayment(invoice)],
        [payment],
        contactIdByCustomerId
      );
      data.mismatches.push(...mismatches);
    } catch (e) {
      if (isResourceMissingError(e)) {
        data.orphans.push(payment);
      } else {
        throw e;
      }
    }
  }

  log.info(
    `📊 Found ${data.mismatches.length} mismatched, ${data.missing.length} missing and ${data.orphans.length} orphaned payments`
  );
  for (const [change, count] of countStatusChanges(data.mismatches)) {
    log.info(`  • ${change}: ${count}`);
  }

  return data;
}

/**
 * Prints a report detailing exactly what changes will be made to payments
 * during the reconciliation process.
 *
 * @param data The payment reconciliation data
 */
function printPaymentReport(data: StripePaymentReconciliation) {
  log.info('');
  log.info('============ Payment Reconciliation Report ============');

  log.info('⚠️ Mismatched payments:');
  if (data.mismatches.length === 0) {
    log.info('  • (none)');
  }
  for (const mismatch of data.mismatches) {
    log.info(`  • ${mismatch.payment.id}: ${printPaymentMismatch(mismatch)}`);
  }

  log.info('📥 Payments missing from our database:');
  if (data.missing.length === 0) {
    log.info('  • (none)');
  }
  for (const { id, contactId, data: payment } of data.missing) {
    log.info(
      `  • ${id}: contact=${contactId}, status=${payment.status}, amount=${payment.amount}`
    );
  }

  log.info('🗑️ Payments without an invoice on Stripe (not changed):');
  if (data.orphans.length === 0) {
    log.info('  • (none)');
  }
  for (const payment of data.orphans) {
    log.info(`  • ${payment.id}: status=${payment.status}`);
  }

  log.info('');
}

/**
 * Write the reconciled payment data to our database. Only the payment rows
 * are written: no emails, activity events or membership changes follow from
 * a fixed payment.
 *
 * @param data The payment reconciliation data
 * @param argv The command line arguments
 * @returns The number of payments that could not be written
 */
async function fixPayments(
  data: StripePaymentReconciliation,
  argv: SyncStripeReconcileArgs
): Promise<number> {
  let failed = 0;

  if (argv.fix.includes('payments')) {
    log.info(`🛠️ Fixing ${data.mismatches.length} mismatched payments...`);
    if (!argv.dryRun) {
      for (const { payment, data: updates } of data.mismatches) {
        try {
          // Only write over the status that was compared: a webhook can
          // have updated the payment since, and its data is newer than ours
          const result = await getRepository(Payment).update(
            { id: payment.id, status: payment.status },
            updates
          );
          if (!result.affected) {
            log.info(`  ⏭️ Skipped ${payment.id}, it changed in the meantime`);
          }
        } catch (e) {
          failed++;
          log.error(`  ❌ Failed to fix payment ${payment.id}`, e);
        }
      }
    }
  }

  if (argv.fix.includes('missing-payments')) {
    log.info(`📥 Creating ${data.missing.length} missing payments...`);
    if (!argv.dryRun) {
      for (const { id, contactId, data: payment } of data.missing) {
        try {
          // Ignore the payment if a webhook has created it since
          await getRepository(Payment)
            .createQueryBuilder()
            .insert()
            .values({ id, contactId, ...payment })
            .orIgnore()
            .execute();
        } catch (e) {
          failed++;
          log.error(`  ❌ Failed to create payment ${id}`, e);
        }
      }
    }
  }

  return failed;
}

/**
 * Process a single contribution, syncing its subscription, mandate and
 * customer as necessary.
 *
 * @param contribution The contribution to process
 * @param argv The command line arguments
 * @param resources The Stripe objects that were already fetched
 */
async function processContribution(
  contribution: ContactContribution,
  argv: SyncStripeReconcileArgs,
  resources: StripeResources
) {
  log.info(`👤 Syncing ${contribution.contact.email}`);

  const updates: Partial<ContactContribution> = {};
  const customer = contribution.customerId
    ? resources.customers.get(contribution.customerId)
    : undefined;

  if (contribution.subscriptionId && argv.fix.includes('subscriptions')) {
    log.info(`  📋 Syncing subscription ${contribution.subscriptionId}`);
    const subscriptionUpdates = await syncSubscription(
      contribution.subscriptionId,
      contribution.contact,
      argv.dryRun,
      resources.subscriptions.get(contribution.subscriptionId)
    );
    Object.assign(updates, subscriptionUpdates);
  }

  if (contribution.mandateId && argv.fix.includes('mandates')) {
    log.info(`  💳 Syncing mandate ${contribution.mandateId}`);
    const mandateUpdates = await syncPaymentMethod(
      contribution.mandateId,
      customer
    );
    Object.assign(updates, mandateUpdates);
  }

  if (contribution.customerId && argv.fix.includes('customers')) {
    log.info(`  👤 Syncing customer ${contribution.customerId}`);
    const customerUpdates = await syncCustomer(
      contribution.customerId,
      customer
    );
    Object.assign(updates, customerUpdates);
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

      if (updates.cancelledAt) {
        await activityService.addEvent({
          eventType: ActivityEventType.ContactContributionCancelled,
          targetId: contribution.contact.id,
          metadata: { subscriptionId: contribution.subscriptionId },
        });
      }
    }
  }
}

/**
 * Reconcile our contribution and payment data with Stripe. This tool can be
 * used to bring our side back in line after webhooks were missed or handled
 * incorrectly.
 *
 * @param argv The command line arguments
 */
export const reconcile = async (
  argv: SyncStripeReconcileArgs
): Promise<void> => {
  await runApp(async () => {
    log.info('📡 Loading Stripe contributions...');
    const contributions = await getRepository(ContactContribution).find({
      where: {
        customerId: Like('cus_%'),
        ...(argv.contactIds && { contactId: In(argv.contactIds) }),
      },
      relations: { contact: true },
    });

    log.info(`📊 Found ${contributions.length} Stripe contributions`);

    if (argv.dryRun) {
      log.info('🔍 DRY RUN - No changes will actually be made');
    }

    if (
      argv.fix.includes('subscriptions') ||
      argv.fix.includes('mandates') ||
      argv.fix.includes('customers')
    ) {
      const resources: StripeResources = {
        subscriptions: new Map(),
        customers: new Map(),
      };
      // Listing the whole account takes far fewer requests than retrieving
      // each object, so only retrieve them all one by one when limited to
      // specific contacts. An object missing from a list is still retrieved,
      // so nothing is removed on the word of a list alone.
      if (!argv.contactIds) {
        if (argv.fix.includes('subscriptions')) {
          resources.subscriptions = await fetchKnown(
            'subscriptions',
            new Set(contributions.map((c) => c.subscriptionId)),
            (page) => stripe.subscriptions.list({ status: 'all', ...page })
          );
        }
        if (argv.fix.includes('mandates') || argv.fix.includes('customers')) {
          resources.customers = await fetchKnown(
            'customers',
            new Set(contributions.map((c) => c.customerId)),
            (page) => stripe.customers.list(page)
          );
        }
      }

      for (const contribution of contributions) {
        await processContribution(contribution, argv, resources);
      }
    }

    let failed = 0;
    if (
      argv.fix.includes('payments') ||
      argv.fix.includes('missing-payments')
    ) {
      const data = await fetchPayments(contributions, argv);
      if (argv.report) {
        printPaymentReport(data);
      }
      failed = await fixPayments(data, argv);
    }

    if (failed > 0) {
      log.error(`❌ Stripe reconciliation completed with ${failed} failures`);
      process.exitCode = 1;
    } else {
      log.info('✅ Stripe reconciliation completed successfully!');
    }
  });
};
