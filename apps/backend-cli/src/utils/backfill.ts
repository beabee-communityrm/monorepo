import { dataSource } from '@beabee/core/database';

import chalk from 'chalk';

import type { EventBackfill } from '../types/index.js';

/**
 * Create a backfill that inserts an event for each source row, or only counts
 * them on a dry run
 */
export const createBackfill =
  ({ eventType, source, fields, params = [] }: EventBackfill) =>
  async (dryRun: boolean): Promise<void> => {
    const queryParams = [eventType, ...params];

    if (dryRun) {
      const [{ count }] = await dataSource.query(
        `SELECT COUNT(*)::int AS count ${source}`,
        queryParams
      );
      console.log(
        `${chalk.green('✓')} Would add ${count} ${eventType} event(s)`
      );
      return;
    }

    const inserted = await dataSource.query(
      `INSERT INTO activity_event ("targetId", "actorType", "actorId", "createdAt", "eventType", "metadata")
       SELECT ${fields} ${source}
       RETURNING id`,
      queryParams
    );
    console.log(
      `${chalk.green('✓')} Added ${inserted.length} ${eventType} event(s)`
    );
  };
