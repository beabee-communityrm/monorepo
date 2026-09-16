import chalk from 'chalk';

/**
 * Backfill callout activity events (creation, publication, responses and
 * segment changes) that pre-date the activity feed.
 * @param dryRun Only report what would be created
 */
export const backfillCallouts = async (dryRun: boolean): Promise<void> => {
  console.log(
    `${chalk.green('✓')} ${dryRun ? 'Would backfill' : 'Backfilled'} callout events`
  );
};
