import { ActivityActorType } from '@beabee/beabee-common';

import chalk from 'chalk';
import type { EntityManager } from 'typeorm';

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
}: EventBackfill): EventBackfiller => {
  const backfill = async (dryRun: boolean, em: EntityManager) => {
    const { eventType } = rule;
    const queryParams = [eventType, ...params];

    // Cast event type to varchar and compare with source to ensure type consistency
    const select = `SELECT $1::varchar, ${fields} ${source}`;

    if (dryRun) {
      const [{ count }] = await em.query(
        `SELECT COUNT(*)::int AS count FROM (${select}) s`,
        queryParams
      );
      console.log(
        `${chalk.green('✓')} Would add ${count} ${eventType} event(s)`
      );
      return [];
    }

    const inserted: { id: string }[] = await em.query(
      `INSERT INTO activity_event ("eventType", "targetId", "actorType", "actorId", "createdAt", "metadata")
       ${select}
       RETURNING id`,
      queryParams
    );
    console.log(
      `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
    );
    return inserted.map(({ id }) => id);
  };

  return { ...rule, backfill };
};
