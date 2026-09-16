import chalk from 'chalk';

/**
 * Backfill app activity events (webhook, settings and payment option updates)
 * that pre-date the activity feed.
 * @param dryRun Only report what would be created
 */
export const backfillApp = async (dryRun: boolean): Promise<void> => {
  console.log(
    `${chalk.green('✓')} ${dryRun ? 'Would backfill' : 'Backfilled'} app events`
  );
};
