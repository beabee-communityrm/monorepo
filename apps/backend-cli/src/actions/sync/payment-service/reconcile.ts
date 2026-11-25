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
  ContributionCustomerState,
  ContributionMandateState,
  ContributionState,
  ContributionSubscriptionState,
  PaymentRecord,
} from '@beabee/core/type';

import { In, IsNull, Not } from 'typeorm';

import type {
  PaymentReconciliation,
  SyncPaymentServiceReconcileArgs,
} from '../../../types/sync.js';
import {
  classifyPaymentRecords,
  countStatusChanges,
  printPaymentMismatch,
} from '../../../utils/payment-reconcile.js';

const log = mainLogger.child({ app: 'sync-payment-service-reconcile' });

/**
 * Sync our subscription data with the payment provider's subscription state
 *
 * @param subscriptionId The subscription ID
 * @param state The subscription's state at the payment provider
 * @returns Any updates to be applied to the contribution, and whether the
 * contact should lose their membership
 */
function syncSubscription(
  subscriptionId: string,
  state: ContributionSubscriptionState
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
 * Sync our mandate data with the payment provider's mandate state
 *
 * @param mandateId The mandate ID
 * @param state The mandate's state at the payment provider
 * @returns Any updates to be applied to the contribution
 */
function syncPaymentMethod(
  mandateId: string,
  state: ContributionMandateState
): { mandateId: null } | undefined {
  switch (state) {
    case 'detached':
      log.info(`    🔌 Detaching mandate ${mandateId}`);
      return { mandateId: null };
    case 'missing':
      log.info(`    🗑️ Removing missing mandate ${mandateId}`);
      return { mandateId: null };
  }
}

/**
 * Sync our customer data with the payment provider's customer state
 *
 * @param customerId The customer ID
 * @param state The customer's state at the payment provider
 * @returns Any updates to be applied to the contribution
 */
function syncCustomer(
  customerId: string,
  state: ContributionCustomerState
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
 * Compare our payments with the payment provider's. Checks the payments
 * created in the reconciliation window, plus all payments we hold as
 * unfinished, as those can change long after they were created.
 *
 * Our payments are read before the provider's, so the provider's payment is
 * never older than ours. Read the other way round, a payment that a webhook
 * updated in between would be set back to the provider's earlier state.
 *
 * @param contributions The contributions to reconcile payments for
 * @param argv The command line arguments
 * @returns The payment reconciliation data
 */
async function fetchPayments(
  contributions: ContactContribution[],
  argv: SyncPaymentServiceReconcileArgs
): Promise<PaymentReconciliation> {
  const contactIdByCustomerId = new Map<string, string>();
  for (const contribution of contributions) {
    if (contribution.customerId) {
      contactIdByCustomerId.set(
        contribution.customerId,
        contribution.contact.id
      );
    }
  }

  log.info('📡 Loading payments...');
  const payments = new Map(
    (
      await getRepository(Payment).find({
        where: { ...(argv.contactIds && { contactId: In(argv.contactIds) }) },
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
    )
      .filter((payment) => paymentBulkService.isPaymentId(payment.id))
      .map((payment) => [payment.id, payment])
  );
  log.info(`📊 Found ${payments.size} payments with the payment provider`);

  let oldest = new Date();
  for (const payment of payments.values()) {
    if (payment.chargeDate < oldest) {
      oldest = payment.chargeDate;
    }
  }

  const records = await paymentBulkService.fetchPayments({
    ...(argv.contactIds && { customerIds: [...contactIdByCustomerId.keys()] }),
    since: argv.since,
    until: argv.until,
    oldest,
  });
  const data: PaymentReconciliation = {
    ...classifyPaymentRecords(records, payments, contactIdByCustomerId),
    orphans: [],
  };

  const checkedIds = new Set(records.map((record) => record.id));
  const unfinished = [...payments.values()].filter(
    (payment) =>
      !checkedIds.has(payment.id) &&
      (payment.status === PaymentStatus.Draft ||
        payment.status === PaymentStatus.Pending)
  );
  const unfinishedRecords = await paymentBulkService.fetchPaymentsByIds(
    unfinished.map((payment) => payment.id)
  );
  const { mismatches } = classifyPaymentRecords(
    [...unfinishedRecords.values()].filter(
      (record): record is PaymentRecord => record !== null
    ),
    payments,
    contactIdByCustomerId
  );
  data.mismatches.push(...mismatches);
  data.orphans = unfinished.filter(
    (payment) => unfinishedRecords.get(payment.id) === null
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
function printPaymentReport(data: PaymentReconciliation) {
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

  log.info('🗑️ Payments the payment provider no longer has (not changed):');
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
  data: PaymentReconciliation,
  argv: SyncPaymentServiceReconcileArgs
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
 * customer with their states at the payment provider.
 *
 * @param contribution The contribution to process
 * @param argv The command line arguments
 * @param state The states of the contribution's objects at the payment provider
 */
async function processContribution(
  contribution: ContactContribution,
  argv: SyncPaymentServiceReconcileArgs,
  state: ContributionState
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
      // The contribution can change while the provider's objects are fetched, so
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
 * Reconcile our contribution and payment data with the payment provider. This
 * tool can be used to bring our side back in line after webhooks were missed
 * or handled incorrectly.
 *
 * @param argv The command line arguments
 */
export const reconcile = async (
  argv: SyncPaymentServiceReconcileArgs
): Promise<void> => {
  if (!paymentBulkService.isEnabled) {
    log.error('❌ No payment provider is configured');
    process.exitCode = 1;
    return;
  }

  await runApp(async () => {
    log.info('📡 Loading contributions...');
    const contributions = (
      await getRepository(ContactContribution).find({
        where: {
          customerId: Not(IsNull()),
          ...(argv.contactIds && { contactId: In(argv.contactIds) }),
        },
        relations: { contact: true },
      })
    ).filter(
      (contribution) =>
        !!contribution.customerId &&
        paymentBulkService.isCustomerId(contribution.customerId)
    );

    log.info(
      `📊 Found ${contributions.length} contributions with the payment provider`
    );

    if (argv.dryRun) {
      log.info('🔍 DRY RUN - No changes will actually be made');
    }

    let failed = 0;
    if (
      argv.fix.includes('subscriptions') ||
      argv.fix.includes('mandates') ||
      argv.fix.includes('customers')
    ) {
      const { states, failures } =
        await paymentBulkService.fetchContributionStates(contributions, {
          partial: !!argv.contactIds,
          subscriptions: argv.fix.includes('subscriptions'),
          mandates: argv.fix.includes('mandates'),
          customers: argv.fix.includes('customers'),
        });

      for (const { contactId, error } of failures) {
        failed++;
        log.error(
          `  ❌ Failed to fetch the payment provider state of ${contactId}`,
          error
        );
      }

      for (const contribution of contributions) {
        const state = states.get(contribution.contactId);
        if (!state) {
          continue;
        }
        try {
          await processContribution(contribution, argv, state);
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
      log.error(`❌ Reconciliation completed with ${failed} failures`);
      process.exitCode = 1;
    } else {
      log.info('✅ Reconciliation completed successfully!');
    }
  });
};
