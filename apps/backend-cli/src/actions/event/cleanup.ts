import { ActivityActorType, ActivityEventType } from '@beabee/beabee-common';
import { dataSource } from '@beabee/core/database';

import chalk from 'chalk';

import type {
  EventBackfillCategory,
  EventDuplicateRule,
} from '../../types/index.js';

// Backfilled rows without an actor, live rows always have one
const noActor = (a: string) =>
  `${a}."actorType" IS NULL AND ${a}."actorId" IS NULL`;

// Backfilled rows with the contact (target) as the actor
const contactActor = (a: string) =>
  `${a}."actorType" = '${ActivityActorType.User}' AND ${a}."actorId" = ${a}."targetId"`;

const sameTarget = `y."targetId" = x."targetId"`;

const rules: Record<EventBackfillCategory, EventDuplicateRule[]> = {
  contact: [
    {
      eventType: ActivityEventType.ContactCreated,
      isBackfilled: noActor,
      sameEvent: sameTarget,
    },
    {
      eventType: ActivityEventType.ContactContributionStarted,
      // Live metadata holds the full contribution update, or is null
      isBackfilled: (a) =>
        `${contactActor(a)} AND COALESCE(${a}.metadata - 'subscriptionId' = '{}'::jsonb, FALSE)`,
      sameEvent: `${sameTarget}
        AND (y.metadata->>'subscriptionId' IS NULL
          OR y.metadata->>'subscriptionId' = x.metadata->>'subscriptionId')`,
    },
    {
      eventType: ActivityEventType.ContactContributionCancelled,
      // Live metadata always holds the subscriptionId
      isBackfilled: (a) => `${contactActor(a)} AND ${a}.metadata IS NULL`,
      sameEvent: sameTarget,
    },
    {
      eventType: ActivityEventType.ContactRoleAdded,
      isBackfilled: noActor,
      sameEvent: `${sameTarget} AND y.metadata->>'roleType' = x.metadata->>'roleType'`,
    },
    {
      eventType: ActivityEventType.ContactSegmentsAdded,
      isBackfilled: noActor,
      sameEvent: sameTarget,
    },
  ],
  callout: [
    {
      eventType: ActivityEventType.CalloutCreated,
      isBackfilled: noActor,
      sameEvent: sameTarget,
    },
    {
      eventType: ActivityEventType.CalloutAnswered,
      // Backfilled and live rows are indistinguishable, so an arbitrary one is kept
      isBackfilled: () => 'TRUE',
      sameEvent: `y.metadata->>'responseId' = x.metadata->>'responseId'`,
    },
    {
      eventType: ActivityEventType.CalloutSegmentsAdded,
      isBackfilled: noActor,
      sameEvent: sameTarget,
    },
  ],
  email: [
    {
      eventType: ActivityEventType.EmailTemplateAdded,
      isBackfilled: noActor,
      sameEvent: sameTarget,
    },
  ],
  payment: [
    {
      eventType: ActivityEventType.ContactPaymentSuccessful,
      isBackfilled: noActor,
      sameEvent: `${sameTarget}
        AND (y.metadata->>'paymentId' = x.metadata->>'paymentId'
          OR (y.metadata->>'paymentId' IS NULL AND y."createdAt" <= x."createdAt"))`,
    },
    {
      eventType: ActivityEventType.ContactPaymentFailed,
      isBackfilled: noActor,
      sameEvent: `${sameTarget} AND y.metadata->>'paymentId' = x.metadata->>'paymentId'`,
    },
  ],
};

// Find backfilled rows with a live duplicate, or a backfilled duplicate with a
// smaller id (so exactly one backfilled row survives). Live rows are never matched
const duplicates = ({ isBackfilled, sameEvent }: EventDuplicateRule) => `
  FROM activity_event x
  WHERE x."eventType" = $1 AND ${isBackfilled('x')}
    AND EXISTS (
      SELECT 1 FROM activity_event y
      WHERE y."eventType" = x."eventType" AND y.id <> x.id
        AND ${sameEvent}
        AND (NOT (${isBackfilled('y')}) OR y.id < x.id)
    )
`;

/**
 * Remove backfilled events duplicated by a live event emitted, or another
 * backfill run, while the backfill was running
 * @param categories The backfilled categories to clean up
 * @param dryRun Only report what would be removed
 */
export const cleanupDuplicates = async (
  categories: readonly EventBackfillCategory[],
  dryRun: boolean
): Promise<void> => {
  for (const rule of categories.flatMap((c) => rules[c])) {
    if (dryRun) {
      const [{ count }] = await dataSource.query(
        `SELECT COUNT(*)::int AS count ${duplicates(rule)}`,
        [rule.eventType]
      );
      console.log(
        `${chalk.green('✓')} Would remove ${count} duplicate ${rule.eventType} event(s)`
      );
      continue;
    }

    // DELETE queries resolve to [rows, affected row count]
    const [, count] = await dataSource.query(
      `DELETE FROM activity_event WHERE id IN (SELECT x.id ${duplicates(rule)})`,
      [rule.eventType]
    );
    console.log(
      `${chalk.green('✓')} Removed ${count} duplicate ${rule.eventType} event(s)`
    );
  }
};
