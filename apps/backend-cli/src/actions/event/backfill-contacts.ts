import { ActivityActorType, ActivityEventType } from '@beabee/beabee-common';
import { dataSource } from '@beabee/core/database';
import gocardless from '@beabee/core/lib/gocardless';
import { stripe } from '@beabee/core/lib/stripe';

import chalk from 'chalk';

// Find contacts without creation event
const noCreatedEvent = `
  FROM contact c
  WHERE NOT EXISTS (
    SELECT 1 FROM activity_event e
    WHERE e."targetId" = c.id AND e."eventType" = $1
  )
`;

// Find cancelled contributions without cancellation event
const noCancelledEvent = `
  FROM contact_contribution cc
  WHERE cc."cancelledAt" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."targetId" = cc."contactId" AND e."eventType" = $1
    )
`;

// Find segments without added event
const noSegmentsAddedEvent = `
  FROM segment s
  WHERE NOT EXISTS (
    SELECT 1 FROM activity_event e
    WHERE e."targetId" = s.id AND e."eventType" = $1
  )`;

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

// Find roles without added event, matched on contact and role type
const noRoleAddedEvent = `
  FROM contact_role cr
  WHERE NOT EXISTS (
    SELECT 1 FROM activity_event e
    WHERE e."targetId" = cr."contactId"
      AND e."eventType" = $1
      AND e.metadata->>'roleType' = cr.type
  )
`;

/**
 * Backfill contact.created events
 * Contact join dates are used as the event time
 * Contacts with pre-existing creation events are ignored
 */
const backfillCreated = async (dryRun: boolean): Promise<void> => {
  const eventType = ActivityEventType.ContactCreated;

  if (dryRun) {
    const [{ count }] = await dataSource.query(
      `SELECT COUNT(*)::int AS count ${noCreatedEvent}`,
      [eventType]
    );
    console.log(`${chalk.green('✓')} Would add ${count} ${eventType} event(s)`);
    return;
  }

  const inserted = await dataSource.query(
    `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
     SELECT c.id, NULL, NULL, c.joined, $1, NULL
     ${noCreatedEvent}
     RETURNING id`,
    [eventType]
  );

  console.log(
    `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
  );
};

/**
 * Get a subscription's creation date from its payment provider
 */
const getSubscriptionCreatedAt = async (
  subscriptionId: string
): Promise<Date> => {
  if (subscriptionId.startsWith('sub_')) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return new Date(subscription.created * 1000); // convert from unix seconds
  }
  const subscription = await gocardless.subscriptions.get(subscriptionId);
  return new Date(subscription.created_at!);
};

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
      const createdAt = await getSubscriptionCreatedAt(subscriptionId);
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
const backfillContributionCancelled = async (
  dryRun: boolean
): Promise<void> => {
  const eventType = ActivityEventType.ContactContributionCancelled;

  if (dryRun) {
    const [{ count }] = await dataSource.query(
      `SELECT COUNT(*)::int AS count ${noCancelledEvent}`,
      [eventType]
    );
    console.log(`${chalk.green('✓')} Would add ${count} ${eventType} event(s)`);
    return;
  }

  const inserted = await dataSource.query(
    `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
     SELECT cc."contactId", $2, cc."contactId", cc."cancelledAt", $1, NULL
     ${noCancelledEvent}
     RETURNING id`,
    [eventType, ActivityActorType.User]
  );

  console.log(
    `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
  );
};

/**
 * Backfill contact.role-added events
 * Roles added in the future are dated now, as they have yet to be granted
 * Roles with a pre-existing added event are ignored
 */
const backfillRoleAdded = async (dryRun: boolean): Promise<void> => {
  const eventType = ActivityEventType.ContactRoleAdded;

  if (dryRun) {
    const [{ count }] = await dataSource.query(
      `SELECT COUNT(*)::int AS count ${noRoleAddedEvent}`,
      [eventType]
    );
    console.log(`${chalk.green('✓')} Would add ${count} ${eventType} event(s)`);
    return;
  }

  const inserted = await dataSource.query(
    `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
     SELECT cr."contactId", NULL, NULL, LEAST(cr."dateAdded", now()), $1,
            jsonb_build_object('roleType', cr.type)
     ${noRoleAddedEvent}
     RETURNING id`,
    [eventType]
  );

  console.log(
    `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
  );
};

/**
 * Backfill contact.segments-added events
 * The segment is the target, as for segments added through the API
 * Segments carry no creation date, so a sentinel date is used as the event time
 */
const backfillSegmentsAdded = async (dryRun: boolean): Promise<void> => {
  const eventType = ActivityEventType.ContactSegmentsAdded;

  if (dryRun) {
    const [{ count }] = await dataSource.query(
      `SELECT COUNT(*)::int AS count ${noSegmentsAddedEvent}`,
      [eventType]
    );
    console.log(`${chalk.green('✓')} Would add ${count} ${eventType} event(s)`);
    return;
  }

  const inserted = await dataSource.query(
    `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
     SELECT s.id, NULL, NULL, TIMESTAMP '0001-01-01 00:00:00', $1, NULL
     ${noSegmentsAddedEvent}
     RETURNING id`,
    [eventType]
  );

  console.log(
    `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
  );
};

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
