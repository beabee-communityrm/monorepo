import { ActivityEventType, PaymentStatus } from '@beabee/beabee-common';
import { dataSource } from '@beabee/core/database';

import chalk from 'chalk';

// Find successful payments without a successful event. Payments charged
// after a contact's first event lacking a paymentId (i.e. created live) are skipped
const noSuccessfulEvent = `
  FROM payment p
  WHERE p.status = $2
    AND p."contactId" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."targetId" = p."contactId" AND e."eventType" = $1
        AND (e.metadata->>'paymentId' = p.id
          OR (e.metadata->>'paymentId' IS NULL AND e."createdAt" <= p."chargeDate"))
    )
`;

/**
 * Backfill contact.payment.successful events
 * Payment charge dates are used as the event time
 */
const backfillPaymentSuccessful = async (dryRun: boolean): Promise<void> => {
  const eventType = ActivityEventType.ContactPaymentSuccessful;

  if (dryRun) {
    const [{ count }] = await dataSource.query(
      `SELECT COUNT(*)::int AS count ${noSuccessfulEvent}`,
      [eventType, PaymentStatus.Successful]
    );
    console.log(`${chalk.green('✓')} Would add ${count} ${eventType} event(s)`);
    return;
  }

  const inserted = await dataSource.query(
    `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
     SELECT p."contactId", NULL, NULL, p."chargeDate", $1,
            jsonb_build_object('paymentId', p.id)
     ${noSuccessfulEvent}
     RETURNING id`,
    [eventType, PaymentStatus.Successful]
  );

  console.log(
    `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
  );
};

/**
 * Backfill payment activity events from existing payment records that
 * pre-date the activity feed.
 * @param dryRun Only report what would be created
 */
export const backfillPayments = async (dryRun: boolean): Promise<void> => {
  await backfillPaymentSuccessful(dryRun);
};
