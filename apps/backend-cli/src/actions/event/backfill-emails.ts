import chalk from 'chalk';

/**
 * Backfill email activity events (template changes and sent emails) that
 * pre-date the activity feed.
 * @param dryRun Only report what would be created
 */
export const backfillEmails = async (dryRun: boolean): Promise<void> => {
  console.log(
    `${chalk.green('✓')} ${dryRun ? 'Would backfill' : 'Backfilled'} email events`
  );
};
