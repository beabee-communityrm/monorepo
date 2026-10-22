import { ActivityEventType, PaymentStatus } from '@beabee/beabee-common';
import { dataSource } from '@beabee/core/database';
import { stripe } from '@beabee/core/lib/stripe';

import chalk from 'chalk';

import { createBackfill } from '../../utils/backfill.js';

/**
 * Backfill contact.payment.successful events
 * Payment charge dates are used as the event time
 * Payments charged after a contact's first event lacking a paymentId
 * (i.e. created live) are skipped
 */
const backfillPaymentSuccessful = createBackfill({
  eventType: ActivityEventType.ContactPaymentSuccessful,
  fields: `p."contactId", NULL, NULL, p."chargeDate", $1,
           jsonb_build_object('paymentId', p.id)`,
  source: `
    FROM payment p
    WHERE p.status = $2
      AND p."contactId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM activity_event e
        WHERE e."targetId" = p."contactId" AND e."eventType" = $1
          AND (e.metadata->>'paymentId' = p.id
            OR (e.metadata->>'paymentId' IS NULL AND e."createdAt" <= p."chargeDate"))
      )`,
  params: [PaymentStatus.Successful],
});

// Find uncollectible invoices ($2 ids, $3 dates) with a contact-linked payment
// (a Stripe payment's id is its invoice id) but without a failed event
const noFailedEvent = `
  FROM unnest($2::text[], $3::timestamptz[]) AS i(id, "uncollectibleAt")
  JOIN payment p ON p.id = i.id
  WHERE p."contactId" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."targetId" = p."contactId" AND e."eventType" = $1
        AND e.metadata->>'paymentId' = p.id
    )
`;

/**
 * Backfill contact.payment.failed events
 * Uncollectible invoices are fetched from Stripe and dated by when they were
 * marked uncollectible
 */
const backfillPaymentFailed = async (dryRun: boolean): Promise<void> => {
  const eventType = ActivityEventType.ContactPaymentFailed;

  const invoices = await stripe.invoices
    .list({ status: 'uncollectible', limit: 100 })
    .autoPagingToArray({ limit: 10000 });

  const params = [
    eventType,
    invoices.map((invoice) => invoice.id),
    invoices.map(
      (invoice) =>
        new Date(
          (invoice.status_transitions.marked_uncollectible_at ??
            invoice.created) * 1000 // convert from unix seconds
        )
    ),
  ];

  if (dryRun) {
    const [{ count }] = await dataSource.query(
      `SELECT COUNT(*)::int AS count ${noFailedEvent}`,
      params
    );
    console.log(
      `${chalk.green('✓')} Would add ${count} ${eventType} event(s) from ${invoices.length} uncollectible invoice(s)`
    );
    return;
  }

  const inserted = await dataSource.query(
    `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
     SELECT p."contactId", NULL, NULL, i."uncollectibleAt", $1,
            jsonb_build_object('paymentId', p.id)
     ${noFailedEvent}
     RETURNING id`,
    params
  );

  console.log(
    `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s) from ${invoices.length} uncollectible invoice(s)`
  );
};

/**
 * Backfill payment activity events from existing payment records that
 * pre-date the activity feed.
 * @param dryRun Only report what would be created
 */
export const backfillPayments = async (dryRun: boolean): Promise<void> => {
  await backfillPaymentSuccessful(dryRun);
  await backfillPaymentFailed(dryRun);
};
