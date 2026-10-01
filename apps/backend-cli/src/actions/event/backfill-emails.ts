import { ActivityEventType } from '@beabee/beabee-common';
import { dataSource } from '@beabee/core/database';

import chalk from 'chalk';

// Find emails without template added event
const noTemplateAddedEvent = `
  FROM email m
  WHERE NOT EXISTS (
    SELECT 1 FROM activity_event e
    WHERE e."targetId" = m.id AND e."eventType" = $1
  )
`;

/**
 * Backfill email.template-added events
 * Email dates are used as the event time
 * Emails with pre-existing template added events are ignored
 * @param dryRun Only report what would be created
 */
export const backfillEmails = async (dryRun: boolean): Promise<void> => {
  const eventType = ActivityEventType.EmailTemplateAdded;

  if (dryRun) {
    const [{ count }] = await dataSource.query(
      `SELECT COUNT(*)::int AS count ${noTemplateAddedEvent}`,
      [eventType]
    );
    console.log(`${chalk.green('✓')} Would add ${count} ${eventType} event(s)`);
    return;
  }

  const inserted = await dataSource.query(
    `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
     SELECT m.id, NULL, NULL, m.date, $1,
            jsonb_build_object('templateId', m."templateId")
     ${noTemplateAddedEvent}
     RETURNING id`,
    [eventType]
  );

  console.log(
    `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
  );
};
