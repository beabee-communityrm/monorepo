import { ActivityEventType } from '@beabee/beabee-common';

import { createBackfill } from '../../utils/backfill.js';

/**
 * Backfill email.template-added events
 * Email dates are used as the event time
 * Emails with pre-existing template added events are ignored
 * @param dryRun Only report what would be created
 */
export const backfillEmails = createBackfill({
  eventType: ActivityEventType.EmailTemplateAdded,
  fields: `m.id, NULL, NULL, m.date, $1,
           jsonb_build_object('templateId', m."templateId")`,
  source: `
    FROM email m
    WHERE NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."targetId" = m.id AND e."eventType" = $1
    )`,
});
