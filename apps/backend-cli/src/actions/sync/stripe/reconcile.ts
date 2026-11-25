import { ActivityEventType, PaymentStatus } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { ContactContribution, Payment } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import {
  activityService,
  contactsService,
  paymentBulkService,
} from '@beabee/core/services';
import type {
  ProviderContributionState,
  ProviderCustomerState,
  ProviderMandateState,
  ProviderPayment,
  ProviderSubscriptionState,
} from '@beabee/core/type';

import { In, IsNull, Like } from 'typeorm';

import type {
  StripePaymentReconciliation,
  SyncStripeReconcileArgs,
} from '../../../types/sync.js';
import {
  classifyInvoicePayments,
  countStatusChanges,
  printPaymentMismatch,
} from '../../../utils/stripe-reconcile.js';

const log = mainLogger.child({ app: 'sync-stripe-reconcile' });

/**
 * Sync our subscription data with the Stripe subscription's state
 *
 * @param subscriptionId The Stripe subscription ID
 * @param state The subscription's state on Stripe
 * @returns Any updates to be applied to the contribution, and whether the
 * contact should lose their membership
 */
function syncSubscription(
  subscriptionId: string,
  state: ProviderSubscriptionState
):
  | {
      updates: { subscriptionId: null; cancelledAt?: Date };
      revokeMember: boolean;
    }
  | undefined {
  switch (state.status) {
    case 'cancelled':
      log.info(`    🚫 Cancelling subscription ${subscriptionId}`);
      return {
        updates: { cancelledAt: state.cancelledAt, subscriptionId: null },
        revokeMember: false,
      };
    case 'expired':
      log.info(`    🗑️ Removing incomplete subscription ${subscriptionId}`);
      return { updates: { subscriptionId: null }, revokeMember: true };
    case 'missing':
      log.info(`    🗑️ Removing missing subscription ${subscriptionId}`);
      return { updates: { subscriptionId: null }, revokeMember: false };
  }
}

/**
 * Sync our payment method data with the Stripe payment method's state
 *
 * @param mandateId The Stripe payment method ID
 * @param state The payment method's state on Stripe
 * @returns Any updates to be applied to the contribution
 */
function syncPaymentMethod(
  mandateId: string,
  state: ProviderMandateState
): { mandateId: null } | undefined {
  switch (state) {
    case 'detached':
      log.info(`    🔌 Detaching payment method ${mandateId}`);
      return { mandateId: null };
    case 'missing':
      log.info(`    🗑️ Removing missing mandate ${mandateId}`);
      return { mandateId: null };
  }
}

/**
 * Sync our customer data with the Stripe customer's state
 *
 * @param customerId The Stripe customer ID
 * @param state The customer's state on Stripe
 * @returns Any updates to be applied to the contribution
 */
function syncCustomer(
  customerId: string,
  state: ProviderCustomerState
): { customerId: null; mandateId: null; subscriptionId: null } | undefined {
  switch (state) {
    case 'deleted':
      log.info(`    🗑️ Removing deleted customer ${customerId}`);
      return { customerId: null, mandateId: null, subscriptionId: null };
    case 'missing':
      log.info(`    🗑️ Removing missing customer ${customerId}`);
      return { customerId: null, mandateId: null, subscriptionId: null };
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

  let oldest = new Date();
  for (const payment of payments.values()) {
    if (payment.chargeDate < oldest) {
      oldest = payment.chargeDate;
    }
  }

  const invoices = await paymentBulkService.fetchPayments({
    ...(argv.contactIds && { customerIds: [...contactIdByCustomerId.keys()] }),
    since: argv.since,
    until: argv.until,
    oldest,
  });
  const data: StripePaymentReconciliation = {
    ...classifyInvoicePayments(invoices, payments, contactIdByCustomerId),
    orphans: [],
  };

  const checkedIds = new Set(invoices.map((invoice) => invoice.id));
  const unfinished = [...payments.values()].filter(
    (payment) =>
      !checkedIds.has(payment.id) &&
      (payment.status === PaymentStatus.Draft ||
        payment.status === PaymentStatus.Pending)
  );
  const unfinishedInvoices = await paymentBulkService.fetchPaymentsByIds(
    unfinished.map((payment) => payment.id)
  );
  const { mismatches } = classifyInvoicePayments(
    [...unfinishedInvoices.values()].filter(
      (invoice): invoice is ProviderPayment => invoice !== null
    ),
    payments,
    contactIdByCustomerId
  );
  data.mismatches.push(...mismatches);
  data.orphans = unfinished.filter(
    (payment) => unfinishedInvoices.get(payment.id) === null
  );

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
 * customer with their states on Stripe.
 *
 * @param contribution The contribution to process
 * @param argv The command line arguments
 * @param state The states of the contribution's Stripe objects
 */
async function processContribution(
  contribution: ContactContribution,
  argv: SyncStripeReconcileArgs,
  state: ProviderContributionState
) {
  log.info(`👤 Syncing ${contribution.contact.email}`);

  const updates: Partial<ContactContribution> = {};
  let revokeMember = false;

  if (contribution.subscriptionId && state.subscription) {
    log.info(`  📋 Syncing subscription ${contribution.subscriptionId}`);
    const result = syncSubscription(
      contribution.subscriptionId,
      state.subscription
    );
    Object.assign(updates, result?.updates);
    revokeMember = !!result?.revokeMember;
  }

  if (contribution.mandateId && state.mandate) {
    log.info(`  💳 Syncing mandate ${contribution.mandateId}`);
    Object.assign(
      updates,
      syncPaymentMethod(contribution.mandateId, state.mandate)
    );
  }

  if (contribution.customerId && state.customer) {
    log.info(`  👤 Syncing customer ${contribution.customerId}`);
    Object.assign(
      updates,
      syncCustomer(contribution.customerId, state.customer)
    );
  }

  // Apply updates
  if (Object.keys(updates).length > 0) {
    log.info(
      `  🔄 Updating contribution`,
      { ...contribution, contact: undefined },
      updates
    );

    if (!argv.dryRun) {
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
  if (!paymentBulkService.isEnabled) {
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

    if (argv.dryRun) {
      log.info('🔍 DRY RUN - No changes will actually be made');
    }

    let failed = 0;
    if (
      argv.fix.includes('subscriptions') ||
      argv.fix.includes('mandates') ||
      argv.fix.includes('customers')
    ) {
      const results = await paymentBulkService.fetchContributionStates(
        contributions,
        {
          partial: !!argv.contactIds,
          subscriptions: argv.fix.includes('subscriptions'),
          mandates: argv.fix.includes('mandates'),
          customers: argv.fix.includes('customers'),
        }
      );

      for (const contribution of contributions) {
        const result = results.get(contribution.contactId) ?? { state: {} };
        try {
          if ('error' in result) {
            throw result.error;
          }
          await processContribution(contribution, argv, result.state);
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
