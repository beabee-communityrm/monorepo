import { ActivityActorType } from '@beabee/beabee-common';
import { dataSource } from '@beabee/core/database';

import chalk from 'chalk';

import type { EventBackfill, EventBackfiller } from '../types/index.js';

// Backfilled rows without an actor, live rows always have one
export const noActor = (a: string) =>
  `${a}."actorType" IS NULL AND ${a}."actorId" IS NULL`;

// Backfilled rows with the contact (target) as the actor
export const contactActor = (a: string) =>
  `${a}."actorType" = '${ActivityActorType.User}' AND ${a}."actorId" = ${a}."targetId"`;

export const sameTarget = `y."targetId" = x."targetId"`;

/**
 * Create a backfill that inserts an event for each source row, or only counts
 * them on a dry run
 */
export const createBackfill = ({
  source,
  fields,
  params = [],
  ...rule
}: EventBackfill): EventBackfiller => ({
  ...rule,
  backfill: async (dryRun) => {
    const { eventType } = rule;
    const queryParams = [eventType, ...params];

    if (dryRun) {
      const [{ count }] = await dataSource.query(
        `SELECT COUNT(*)::int AS count ${source}`,
        queryParams
      );
      console.log(
        `${chalk.green('✓')} Would add ${count} ${eventType} event(s)`
      );
      return [];
    }

    const inserted: { id: string }[] = await dataSource.query(
      `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
       SELECT ${fields} ${source}
       RETURNING id`,
      queryParams
    );
    console.log(
      `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
    );
    return inserted.map(({ id }) => id);
  },
});
