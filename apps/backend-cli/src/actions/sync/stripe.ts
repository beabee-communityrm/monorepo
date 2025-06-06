import { PaymentMethod } from '@beabee/beabee-common';
import { In } from 'typeorm';
import { log as mainLogger } from '@beabee/core/logging';
import { getRepository } from '@beabee/core/database';
import { runApp } from '@beabee/core/server';
import { stripe } from '@beabee/core/lib/stripe';
import { ContactContribution } from '@beabee/core/models';
import { contactsService } from '@beabee/core/services';
import { StripeWebhookEventHandler } from '@beabee/core/lib/stripe-webhook-event-handler';

const log = mainLogger.child({ app: 'stripe-sync' });

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

export const syncStripe = async (dryRun: boolean): Promise<void> => {
  await runApp(async () => {
    const contributions = await getRepository(ContactContribution).find({
      where: {
        method: In([
          PaymentMethod.StripeBACS,
          PaymentMethod.StripeCard,
          PaymentMethod.StripeSEPA,
        ]),
      },
      relations: { contact: true },
    });

    log.info(`Processing ${contributions.length} Stripe contributions`);

    for (const contribution of contributions) {
      log.info(`Checking ${contribution.contact.email}`);

      const updates: Partial<ContactContribution> = {};

      // Check subscription status
      if (contribution.subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            contribution.subscriptionId
          );
          if (subscription.status === 'canceled') {
            log.info(`Cancelling subscription ${contribution.subscriptionId}`);
            updates.cancelledAt = subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : new Date();
            updates.subscriptionId = null;
          } else if (subscription.status === 'incomplete_expired') {
            log.info(
              `Removing incomplete subscription ${contribution.subscriptionId}`
            );
            updates.subscriptionId = null;
            if (!dryRun) {
              await contactsService.revokeContactRole(
                contribution.contact,
                'member'
              );
            }
          }
        } catch (e) {
          log.info(
            `Removing missing subscription ${contribution.subscriptionId}`
          );
          updates.subscriptionId = null;
        }
      }

      // Check mandate status
      if (contribution.mandateId) {
        try {
          const paymentMethod = await stripe.paymentMethods.retrieve(
            contribution.mandateId
          );
          if (!paymentMethod.customer) {
            log.info(`Detaching payment method ${contribution.mandateId}`);
            updates.mandateId = null;
          }
        } catch (e) {
          log.info(`Removing mandate ${contribution.mandateId}`);
          updates.mandateId = null;
        }
      }

      // Check customer and process invoices
      if (contribution.customerId) {
        try {
          const customer = await stripe.customers.retrieve(
            contribution.customerId
          );
          if (customer.deleted) {
            log.info(`Removing deleted customer ${contribution.customerId}`);
            updates.customerId = null;
            updates.mandateId = null;
            updates.subscriptionId = null;
          } else if (!dryRun) {
            // Process invoices
            for await (const invoice of fetchInvoices(
              contribution.customerId
            )) {
              log.info(`Processing invoice ${invoice.id}`);
              await StripeWebhookEventHandler.handleInvoiceUpdated(invoice);
              if (invoice.paid) {
                await StripeWebhookEventHandler.handleInvoicePaid(invoice);
              }
            }
          }
        } catch (e) {
          log.error(`Error processing customer ${contribution.customerId}`, e);
        }
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        if (dryRun) {
          log.info('DRY RUN - Would update contribution:', updates);
        } else {
          log.info('Updating contribution');
          await getRepository(ContactContribution).update(
            contribution.contact.id,
            updates
          );
        }
      }
    }

    log.info('Stripe sync completed');
  });
};
