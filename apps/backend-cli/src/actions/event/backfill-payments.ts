import { ActivityEventType, PaymentStatus } from '@beabee/beabee-common';
import { stripe } from '@beabee/core/lib/stripe';

import chalk from 'chalk';

import type { EventBackfiller } from '../../types/index.js';
import { createBackfill, noActor, sameTarget } from '../../utils/backfill.js';

/**
 * Backfill contact.payment.successful events
 * Payment charge dates are used as the event time
 */
const backfillPaymentSuccessful = createBackfill({
  eventType: ActivityEventType.ContactPaymentSuccessful,
  fields: `p."contactId", NULL, NULL, p."chargeDate",
           jsonb_build_object('paymentId', p.id)`,
  source: `
    FROM payment p
    WHERE p.status = $2
      AND p."contactId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM activity_event e
        WHERE e."targetId" = p."contactId" AND e."eventType" = $1
          AND e.metadata->>'paymentId' = p.id
      )`,
  params: [PaymentStatus.Successful],
  isBackfilled: noActor,
  sameEvent: `${sameTarget} AND y.metadata->>'paymentId' = x.metadata->>'paymentId'`,
});

//  Replace all contact.payment.successful events with one per successful payment
//  Event details are the same as for backfillPaymentSuccessful
const insertPaymentSuccessful = createBackfill({
  eventType: ActivityEventType.ContactPaymentSuccessful,
  fields: `p."contactId", NULL, NULL, p."chargeDate",
           jsonb_build_object('paymentId', p.id)`,
  source: `FROM payment p WHERE p.status = $2 AND p."contactId" IS NOT NULL`,
  params: [PaymentStatus.Successful],
  isBackfilled: noActor,
  sameEvent: `${sameTarget} AND y.metadata->>'paymentId' = x.metadata->>'paymentId'`,
});

// Remove all successful payment events, then backfill (both in the same transaction)
const refillPaymentSuccessful: EventBackfiller = {
  ...insertPaymentSuccessful,
  backfill: async (dryRun, em) => {
    if (!dryRun) {
      const [, deleted] = await em.query(
        `DELETE FROM activity_event WHERE "eventType" = $1`,
        [insertPaymentSuccessful.eventType]
      );
      console.log(
        `${chalk.green('✓')} Deleted ${deleted} ${insertPaymentSuccessful.eventType} event(s)`
      );
    }
    return insertPaymentSuccessful.backfill(dryRun, em);
  },
};

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
const backfillPaymentFailed: EventBackfiller = {
  eventType: ActivityEventType.ContactPaymentFailed,
  isBackfilled: noActor,
  sameEvent: `${sameTarget} AND y.metadata->>'paymentId' = x.metadata->>'paymentId'`,
  backfill: async (dryRun, em) => {
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
      const [{ count }] = await em.query(
        `SELECT COUNT(*)::int AS count ${noFailedEvent}`,
        params
      );
      console.log(
        `${chalk.green('✓')} Would add ${count} ${eventType} event(s) from ${invoices.length} uncollectible invoice(s)`
      );
      return [];
    }

    const inserted: { id: string }[] = await em.query(
      `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
       SELECT p."contactId", NULL, NULL, i."uncollectibleAt", $1::varchar,
              jsonb_build_object('paymentId', p.id)
       ${noFailedEvent}
       RETURNING id`,
      params
    );

    console.log(
      `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s) from ${invoices.length} uncollectible invoice(s)`
    );
    return inserted.map(({ id }) => id);
  },
};

/** Payment activity events from existing payment records that pre-date the activity feed */
export const paymentBackfills: EventBackfiller[] = [
  //backfillPaymentSuccessful,
  refillPaymentSuccessful,
  backfillPaymentFailed,
];
