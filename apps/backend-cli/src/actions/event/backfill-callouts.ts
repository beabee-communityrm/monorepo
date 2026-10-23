import { ActivityActorType, ActivityEventType } from '@beabee/beabee-common';

import type { EventBackfiller } from '../../types/index.js';
import { createBackfill, noActor, sameTarget } from '../../utils/backfill.js';

/**
 * Backfill callout.created events
 * Callout dates are used as the event time
 * Callouts with pre-existing creation events are ignored
 */
const backfillCreated = createBackfill({
  eventType: ActivityEventType.CalloutCreated,
  fields: `c.id, NULL, NULL, c.date, $1, NULL`,
  source: `
    FROM callout c
    WHERE NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."targetId" = c.id AND e."eventType" = $1
    )`,
  isBackfilled: noActor,
  sameEvent: sameTarget,
});

/**
 * Backfill callout.answered events
 * The callout is the target, the responding contact the actor (null for guests)
 * Response creation dates are used as the event time
 */
const backfillAnswered = createBackfill({
  eventType: ActivityEventType.CalloutAnswered,
  fields: `r."calloutId", $2, r."contactId", r."createdAt", $1,
           jsonb_build_object('responseId', r.id)`,
  source: `
    FROM callout_response r
    WHERE NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."eventType" = $1 AND e.metadata->>'responseId' = r.id::text
    )`,
  params: [ActivityActorType.User],
  // Backfilled and live rows are indistinguishable, so any other row is kept
  isBackfilled: () => 'FALSE',
  sameEvent: `y.metadata->>'responseId' = x.metadata->>'responseId'`,
});

/**
 * Backfill callout.segments-added events
 * The segment is the target, as for segments added through the API
 * Segments carry no creation date, so a sentinel date is used as the event time
 */
const backfillSegmentsAdded = createBackfill({
  eventType: ActivityEventType.CalloutSegmentsAdded,
  fields: `s.id, NULL, NULL, TIMESTAMP '0001-01-01 00:00:00', $1, NULL`,
  source: `
    FROM callout_response_segment s
    WHERE NOT EXISTS (
      SELECT 1 FROM activity_event e
      WHERE e."targetId" = s.id AND e."eventType" = $1
    )`,
  isBackfilled: noActor,
  sameEvent: sameTarget,
});

/** Callout activity events that pre-date the activity feed */
export const calloutBackfills: EventBackfiller[] = [
  backfillCreated,
  backfillAnswered,
  backfillSegmentsAdded,
];
