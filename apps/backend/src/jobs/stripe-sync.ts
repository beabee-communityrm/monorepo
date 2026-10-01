import { JobName, StripeSyncJobArgs } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import {
  Stripe,
  convertInvoiceToPayment,
  stripe,
} from '@beabee/core/lib/stripe';
import { StripeWebhookEventHandler } from '@beabee/core/lib/stripe-webhook-event-handler';
import { Contact, ContactContribution, Payment } from '@beabee/core/models';
import { contactsService } from '@beabee/core/services';

import { In, Like } from 'typeorm';

import { StripeSyncJobArgsDto } from '#api/dto/JobDto';
import type { Job, JobLogger } from '#type/job';

function isResourceMissingError(e: unknown): boolean {
  return (
    e instanceof Stripe.errors.StripeError && e.code === 'resource_missing'
  );
}

/** Fetches every invoice of a customer, following Stripe's cursor paging */
async function* fetchInvoices(customerId: string) {
  let startingAfter: string | undefined;
  for (;;) {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100,
      ...(startingAfter && { starting_after: startingAfter }),
    });
    yield* invoices.data;
    if (!invoices.has_more || invoices.data.length === 0) {
      return;
    }
    startingAfter = invoices.data[invoices.data.length - 1].id;
  }
}

/**
 * Sync our subscription data with the live Stripe data
 * @returns Any updates to be applied to the contribution
 */
async function syncSubscription(
  subscriptionId: string,
  contact: Contact,
  dryRun: boolean,
  log: JobLogger
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
 * @returns Any updates to be applied to the contribution
 */
async function syncPaymentMethod(
  mandateId: string,
  log: JobLogger
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
 * @returns Any updates to be applied to the contribution
 */
async function syncCustomer(
  customerId: string,
  log: JobLogger
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
 * updating existing ones. A paid invoice also extends the membership role.
 */
async function syncPayments(
  customerId: string,
  payments: Payment[],
  dryRun: boolean,
  log: JobLogger
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
      await StripeWebhookEventHandler.handleInvoiceUpdated(invoice);

      // A paid invoice must also update the membership role
      if (invoice.paid) {
        await StripeWebhookEventHandler.handleInvoicePaid(invoice, false);
      }
    }
  }
}

/** Syncs one contribution's subscription, mandate, customer and payments */
async function processContribution(
  contribution: ContactContribution,
  args: StripeSyncJobArgs,
  log: JobLogger
) {
  const dryRun = !!args.dryRun;
  log.info(`👤 Syncing ${contribution.contact.email}`);

  const updates: Partial<ContactContribution> = {};

  if (contribution.subscriptionId && args.fix.includes('subscriptions')) {
    log.info(`  📋 Syncing subscription ${contribution.subscriptionId}`);
    const subscriptionUpdates = await syncSubscription(
      contribution.subscriptionId,
      contribution.contact,
      dryRun,
      log
    );
    Object.assign(updates, subscriptionUpdates);
  }

  if (contribution.mandateId && args.fix.includes('mandates')) {
    log.info(`  💳 Syncing mandate ${contribution.mandateId}`);
    const mandateUpdates = await syncPaymentMethod(contribution.mandateId, log);
    Object.assign(updates, mandateUpdates);
  }

  if (contribution.customerId) {
    if (args.fix.includes('customers')) {
      log.info(`  👤 Syncing customer ${contribution.customerId}`);
      const customerUpdates = await syncCustomer(contribution.customerId, log);
      Object.assign(updates, customerUpdates);
    }

    if (args.fix.includes('payments')) {
      log.info(`  💰 Syncing payments for customer ${contribution.customerId}`);
      const payments = await getRepository(Payment).findBy({
        contactId: contribution.contact.id,
      });
      try {
        await syncPayments(contribution.customerId, payments, dryRun, log);
      } catch (e) {
        // Ignore missing customer errors here as they are handled above
        if (!isResourceMissingError(e)) {
          throw e;
        }
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    log.info(`  🔄 Updating contribution: ${JSON.stringify(updates)}`);

    if (!dryRun) {
      await getRepository(ContactContribution).update(
        contribution.contact.id,
        updates
      );
    }
  }
}

/**
 * Synchronises contribution data with Stripe, so subscriptions, mandates and
 * customers are up to date and membership roles are extended or revoked
 */
export const stripeSyncJob: Job<JobName.StripeSync> = {
  argsDto: StripeSyncJobArgsDto,
  async run(args, log) {
    log.info('📡 Loading Stripe contributions...');
    const contributions = await getRepository(ContactContribution).find({
      where: {
        customerId: Like('cus_%'),
        ...(args.contactIds && { contactId: In(args.contactIds) }),
      },
      relations: { contact: true },
    });

    log.info(`📊 Processing ${contributions.length} Stripe contributions`);

    if (args.dryRun) {
      log.info('🔍 DRY RUN - No changes will actually be made');
    }

    for (const contribution of contributions) {
      await processContribution(contribution, args, log);
    }

    log.info('✅ Stripe sync completed successfully!');
  },
};
