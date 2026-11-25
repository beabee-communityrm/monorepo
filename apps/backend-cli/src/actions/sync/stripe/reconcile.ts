import { ActivityEventType, PaymentStatus } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import { getRepository } from '@beabee/core/database';
import {
  Stripe,
  convertInvoiceToPayment,
  stripe,
} from '@beabee/core/lib/stripe';
import { log as mainLogger } from '@beabee/core/logging';
import { ContactContribution, Payment } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { activityService, contactsService } from '@beabee/core/services';

import { setTimeout } from 'node:timers/promises';
import { In, IsNull, Like } from 'typeorm';

import type {
  StripeInvoicePayment,
  StripePaymentReconciliation,
  StripeResources,
  SyncStripeReconcileArgs,
} from '../../../types/sync.js';
import {
  classifyInvoicePayments,
  countStatusChanges,
  getCreatedWindows,
  printPaymentMismatch,
} from '../../../utils/stripe-reconcile.js';

const log = mainLogger.child({ app: 'sync-stripe-reconcile' });

const MAX_RATE_LIMIT_RETRIES = 5;

/** The number of invoice lists fetched at the same time */
const INVOICE_LIST_CONCURRENCY = 4;

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
 * @param listed The subscription if it was already fetched
 * @returns Any updates to be applied to the contribution, and whether the
 * contact should lose their membership
 */
async function syncSubscription(
  subscriptionId: string,
  listed: Stripe.Subscription | undefined
): Promise<
  | {
      updates: { subscriptionId: null; cancelledAt?: Date };
      revokeMember: boolean;
    }
  | undefined
> {
  try {
    const subscription =
      listed ||
      (await retryRateLimited(() =>
        stripe.subscriptions.retrieve(subscriptionId)
      ));
    if (subscription.status === 'canceled') {
      log.info(`    🚫 Cancelling subscription ${subscriptionId}`);

      return {
        updates: {
          cancelledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : new Date(),
          subscriptionId: null,
        },
        revokeMember: false,
      };
    } else if (subscription.status === 'incomplete_expired') {
      log.info(`    🗑️ Removing incomplete subscription ${subscriptionId}`);

      return { updates: { subscriptionId: null }, revokeMember: true };
    }
  } catch (e) {
    if (isResourceMissingError(e)) {
      log.info(`    🗑️ Removing missing subscription ${subscriptionId}`);
      return { updates: { subscriptionId: null }, revokeMember: false };
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
    const paymentMethod = await retryRateLimited(() =>
      stripe.paymentMethods.retrieve(mandateId)
    );
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
    const customer =
      listed ||
      (await retryRateLimited(() => stripe.customers.retrieve(customerId)));
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
 * Our payments are read before the first invoice, so an invoice is never
 * older than the payment it is compared with. Read the other way round, a
 * payment that a webhook updated in between would be set back to the
 * invoice's earlier state.
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

  log.info('📡 Loading Stripe payments...');
  const payments = new Map(
    (
      await getRepository(Payment).find({
        where: {
          id: Like('in_%'),
          ...(argv.contactIds && { contactId: In(argv.contactIds) }),
        },
        select: {
          id: true,
          status: true,
          amount: true,
          chargeDate: true,
          description: true,
          subscriptionId: true,
          type: true,
        },
      })
    ).map((payment) => [payment.id, payment])
  );
  log.info(`📊 Found ${payments.size} Stripe payments`);

  const window: Stripe.InvoiceListParams =
    argv.since || argv.until
      ? {
          created: {
            ...(argv.since && { gte: Math.floor(argv.since.getTime() / 1000) }),
            ...(argv.until && { lte: Math.floor(argv.until.getTime() / 1000) }),
          },
        }
      : {};
  const now = new Date();
  let oldest = now;
  for (const payment of payments.values()) {
    if (payment.chargeDate < oldest) {
      oldest = payment.chargeDate;
    }
  }
  // Listing the whole account takes far fewer requests than listing each
  // customer, so only list by customer when limited to specific contacts.
  // The account is listed a month at a time: one list can only be read page
  // after page, separate months can be fetched at the same time.
  const filters: Stripe.InvoiceListParams[] = argv.contactIds
    ? [...contactIdByCustomerId.keys()].map((customer) => ({
        ...window,
        customer,
      }))
    : getCreatedWindows(oldest, now, argv.since, argv.until).map((created) =>
        Object.keys(created).length > 0 ? { created } : {}
      );

  log.info(`📡 Fetching Stripe invoices in ${filters.length} lists...`);
  const checkedIds = new Set<string>();
  const queue = [...filters];
  let done = 0;
  await Promise.all(
    Array.from({ length: INVOICE_LIST_CONCURRENCY }, async () => {
      for (let filter = queue.shift(); filter; filter = queue.shift()) {
        const params = filter;
        try {
          for await (const invoices of fetchPages((page) =>
            stripe.invoices.list({ ...params, ...page })
          )) {
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
            log.info(
              `  • Fetched ${checkedIds.size} invoices, ${done} of ${filters.length} lists done`
            );
          }
        } catch (e) {
          // A missing customer is handled by the customers fix
          if (!isResourceMissingError(e)) {
            throw e;
          }
        }
        done++;
      }
    })
  );

  log.info('📡 Fetching Stripe invoices of unfinished payments...');
  for (const payment of payments.values()) {
    if (
      checkedIds.has(payment.id) ||
      (payment.status !== PaymentStatus.Draft &&
        payment.status !== PaymentStatus.Pending)
    ) {
      continue;
    }

    try {
      const invoice = await retryRateLimited(() =>
        stripe.invoices.retrieve(payment.id)
      );
      const { mismatches } = classifyInvoicePayments(
        [toInvoicePayment(invoice)],
        payments,
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
      `  • ${id}: contact=${contactId}, status=${payment.status}, amount=${payment.amount}, chargeDate=${payment.chargeDate.toISOString()}`
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
    if (argv.danger) {
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
    if (argv.danger) {
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
  let revokeMember = false;
  const customer = contribution.customerId
    ? resources.customers.get(contribution.customerId)
    : undefined;

  if (contribution.subscriptionId && argv.fix.includes('subscriptions')) {
    log.info(`  📋 Syncing subscription ${contribution.subscriptionId}`);
    const result = await syncSubscription(
      contribution.subscriptionId,
      resources.subscriptions.get(contribution.subscriptionId)
    );
    Object.assign(updates, result?.updates);
    revokeMember = !!result?.revokeMember;
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

    if (argv.danger) {
      // The contribution can change while the Stripe objects are fetched, so
      // only write if it still has the ids that were checked
      const result = await getRepository(ContactContribution).update(
        {
          contactId: contribution.contact.id,
          subscriptionId: contribution.subscriptionId ?? IsNull(),
          mandateId: contribution.mandateId ?? IsNull(),
          customerId: contribution.customerId ?? IsNull(),
        },
        updates
      );
      if (!result.affected) {
        log.info('  ⏭️ Skipped, the contribution changed in the meantime');
        return;
      }

      if (revokeMember) {
        await contactsService.revokeContactRole(contribution.contact, 'member');
      }
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
  if (!config.stripe.secretKey) {
    log.error('❌ BEABEE_STRIPE_SECRETKEY is not set');
    process.exitCode = 1;
    return;
  }

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

    if (!argv.danger) {
      log.info('🔍 DRY RUN - No changes will actually be made');
    }

    let failed = 0;
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
        try {
          await processContribution(contribution, argv, resources);
        } catch (e) {
          failed++;
          log.error(`  ❌ Failed to sync ${contribution.contact.email}`, e);
        }
      }
    }

    if (
      argv.fix.includes('payments') ||
      argv.fix.includes('missing-payments')
    ) {
      const data = await fetchPayments(contributions, argv);
      if (argv.report) {
        printPaymentReport(data);
      }
      failed += await fixPayments(data, argv);
    }

    if (failed > 0) {
      log.error(`❌ Stripe reconciliation completed with ${failed} failures`);
      process.exitCode = 1;
    } else {
      log.info('✅ Stripe reconciliation completed successfully!');
    }
  });
};
