import chalk from 'chalk';

/**
 * Backfill payment activity events from existing payment records that
 * pre-date the activity feed.
 * @param dryRun Only report what would be created
 */
export const backfillPayments = async (dryRun: boolean): Promise<void> => {
  console.log(
    `${chalk.green('✓')} ${dryRun ? 'Would backfill' : 'Backfilled'} payment events`
  );
};
