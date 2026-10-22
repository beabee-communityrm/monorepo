import { ActivityActorType, ActivityEventType } from '@beabee/beabee-common';
import { dataSource } from '@beabee/core/database';
import { paymentService } from '@beabee/core/services';

import chalk from 'chalk';

import { createBackfill } from '../../utils/backfill.js';

// Find each contact's charged subscriptions without start event. Contacts with
// a start event lacking a subscriptionId (i.e. created live) are skipped
const noStartedEvent = `
  SELECT DISTINCT p."contactId", p."subscriptionId"
  FROM payment p
  WHERE p."contactId" IS NOT NULL AND p."subscriptionId" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."targetId" = p."contactId" AND e."eventType" = $1
        AND (e.metadata->>'subscriptionId' IS NULL
          OR e.metadata->>'subscriptionId' = p."subscriptionId")
    )`;

/**
 * Backfill contact.created events
 * Contact join dates are used as the event time
 * Contacts with pre-existing creation events are ignored
 */
const backfillCreated = createBackfill({
  eventType: ActivityEventType.ContactCreated,
  fields: `c.id, NULL, NULL, c.joined, $1, NULL`,
  source: `
    FROM contact c
    WHERE NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."targetId" = c.id AND e."eventType" = $1
    )`,
});

/**
 * Backfill contact.contribution-started events
 * The contact is both the target and the actor
 * One event per subscription, dated by its creation date at the payment provider
 */
const backfillContributionStarted = async (dryRun: boolean): Promise<void> => {
  const eventType = ActivityEventType.ContactContributionStarted;

  const rows: { contactId: string; subscriptionId: string }[] =
    await dataSource.query(noStartedEvent, [eventType]);

  if (dryRun) {
    console.log(
      `${chalk.green('✓')} Would add ${rows.length} ${eventType} event(s)`
    );
    return;
  }

  let added = 0;
  for (const { contactId, subscriptionId } of rows) {
    try {
      const createdAt =
        await paymentService.getSubscriptionCreatedAt(subscriptionId);
      await dataSource.query(
        `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
         VALUES ($1, $2, $1, $3, $4, jsonb_build_object('subscriptionId', $5::text))`,
        [
          contactId,
          ActivityActorType.User,
          createdAt,
          eventType,
          subscriptionId,
        ]
      );
      added++;
    } catch (err) {
      console.log(
        `${chalk.red('✗')} Failed ${eventType} for contact ${contactId} (${subscriptionId}): ${err}`
      );
    }
  }

  console.log(
    `${chalk.green('✓')} Added ${added} of ${rows.length} ${eventType} event(s)`
  );
};

/**
 * Backfill contact.contribution-cancelled events
 * The contact is both the target and the actor
 * Contribution cancellation dates are used as the event time
 * Contacts with pre-existing cancellation events are ignored
 */
const backfillContributionCancelled = createBackfill({
  eventType: ActivityEventType.ContactContributionCancelled,
  fields: `cc."contactId", $2, cc."contactId", cc."cancelledAt", $1, NULL`,
  source: `
    FROM contact_contribution cc
    WHERE cc."cancelledAt" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM activity_event e
        WHERE e."targetId" = cc."contactId" AND e."eventType" = $1
      )`,
  params: [ActivityActorType.User],
});

/**
 * Backfill contact.role-added events
 * Roles added in the future are dated now, as they have yet to be granted
 * Roles with a pre-existing added event, matched on contact and role type, are ignored
 */
const backfillRoleAdded = createBackfill({
  eventType: ActivityEventType.ContactRoleAdded,
  fields: `cr."contactId", NULL, NULL, LEAST(cr."dateAdded", now()), $1,
           jsonb_build_object('roleType', cr.type)`,
  source: `
    FROM contact_role cr
    WHERE NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."targetId" = cr."contactId" AND e."eventType" = $1
        AND e.metadata->>'roleType' = cr.type
    )`,
});

/**
 * Backfill contact.segments-added events
 * The segment is the target, as for segments added through the API
 * Segments carry no creation date, so a sentinel date is used as the event time
 */
const backfillSegmentsAdded = createBackfill({
  eventType: ActivityEventType.ContactSegmentsAdded,
  fields: `s.id, NULL, NULL, TIMESTAMP '0001-01-01 00:00:00', $1, NULL`,
  source: `
    FROM segment s
    WHERE NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."targetId" = s.id AND e."eventType" = $1
    )`,
});

/**
 * Backfill contact activity events that pre-date the activity feed.
 * @param dryRun Only report what would be created
 */
export const backfillContacts = async (dryRun: boolean): Promise<void> => {
  await backfillCreated(dryRun);
  await backfillContributionStarted(dryRun);
  await backfillContributionCancelled(dryRun);
  await backfillRoleAdded(dryRun);
  await backfillSegmentsAdded(dryRun);
};
