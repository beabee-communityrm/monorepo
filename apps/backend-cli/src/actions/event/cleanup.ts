import { dataSource } from '@beabee/core/database';

import chalk from 'chalk';

import type { EventDuplicateRule } from '../../types/index.js';

// Find rows inserted by this backfill ($1) with a live duplicate, or a backfilled
// duplicate with a smaller id (so exactly one backfilled row survives). Rows not
// inserted by this backfill are never matched
const duplicates = ({ isBackfilled, sameEvent }: EventDuplicateRule) => `
  FROM activity_event x
  WHERE x.id = ANY($1::uuid[])
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
 * @param backfilled Each backfill's duplicate rule with the ids it inserted
 */
export const cleanupDuplicates = async (
  backfilled: { rule: EventDuplicateRule; ids: string[] }[]
): Promise<void> => {
  for (const { rule, ids } of backfilled) {
    // DELETE queries resolve to [rows, affected row count]
    const [, count] = await dataSource.query(
      `DELETE FROM activity_event WHERE id IN (SELECT x.id ${duplicates(rule)})`,
      [ids]
    );
    console.log(
      `${chalk.green('✓')} Removed ${count} duplicate ${rule.eventType} event(s)`
    );
  }
};
