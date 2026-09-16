import { ActivityActorType, ActivityEventType } from '@beabee/beabee-common';
import { dataSource } from '@beabee/core/database';

import chalk from 'chalk';

// Find contacts without creation event
const noCreatedEvent = `
  FROM contact c
  WHERE NOT EXISTS (
    SELECT 1 FROM activity_event e
    WHERE e."targetId" = c.id AND e."eventType" = $1
  )
`;

/**
 * Backfill contact.created events
 * Contact join dates are used as the event time
 * Contacts with pre-existing creation events are ignored
 */
export const backfillContacts = async (dryRun: boolean): Promise<void> => {
  const eventType = ActivityEventType.ContactCreated;

  if (dryRun) {
    const [{ count }] = await dataSource.query(
      `SELECT COUNT(*)::int AS count ${noCreatedEvent}`,
      [eventType]
    );
    console.log(`${chalk.green('✓')} Would add ${count} ${eventType} event(s)`);
    return;
  }

  // TODO: Decide actor type
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
