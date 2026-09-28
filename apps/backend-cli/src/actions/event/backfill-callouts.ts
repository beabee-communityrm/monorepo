import { ActivityActorType, ActivityEventType } from '@beabee/beabee-common';
import { dataSource } from '@beabee/core/database';

import chalk from 'chalk';

// Find callouts without creation event
const noCreatedEvent = `
  FROM callout c
  WHERE NOT EXISTS (
    SELECT 1 FROM activity_event e
    WHERE e."targetId" = c.id AND e."eventType" = $1
  )
`;

// Find responses without answered event
const noAnsweredEvent = `
  FROM callout_response r
  WHERE NOT EXISTS (
    SELECT 1 FROM activity_event e
    WHERE e."eventType" = $1 AND e.metadata->>'responseId' = r.id::text
  )
`;

/**
 * Backfill callout.created events
 * Callout dates are used as the event time
 * Callouts with pre-existing creation events are ignored
 */
const backfillCreated = async (dryRun: boolean): Promise<void> => {
  const eventType = ActivityEventType.CalloutCreated;

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
     SELECT c.id, NULL, NULL, c.date, $1, NULL
     ${noCreatedEvent}
     RETURNING id`,
    [eventType]
  );

  console.log(
    `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
  );
};

/**
 * Backfill callout.answered events
 * The callout is the target, the responding contact the actor (null for guests)
 * Response creation dates are used as the event time
 */
const backfillAnswered = async (dryRun: boolean): Promise<void> => {
  const eventType = ActivityEventType.CalloutAnswered;

  if (dryRun) {
    const [{ count }] = await dataSource.query(
      `SELECT COUNT(*)::int AS count ${noAnsweredEvent}`,
      [eventType]
    );
    console.log(`${chalk.green('✓')} Would add ${count} ${eventType} event(s)`);
    return;
  }

  const inserted = await dataSource.query(
    `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
     SELECT r."calloutId", $2, r."contactId", r."createdAt", $1,
            jsonb_build_object('responseId', r.id)
     ${noAnsweredEvent}
     RETURNING id`,
    [eventType, ActivityActorType.User]
  );

  console.log(
    `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
  );
};

/**
 * Backfill callout activity events that pre-date the activity feed.
 * @param dryRun Only report what would be created
 */
export const backfillCallouts = async (dryRun: boolean): Promise<void> => {
  await backfillCreated(dryRun);
  await backfillAnswered(dryRun);
};
