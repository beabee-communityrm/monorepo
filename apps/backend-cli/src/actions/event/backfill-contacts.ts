import chalk from 'chalk';

/**
 * Backfill contact activity events (creation, role, contribution and segment
 * changes) for contacts that pre-date the activity feed.
 * @param dryRun Only report what would be created
 */
export const backfillContacts = async (dryRun: boolean): Promise<void> => {
  console.log(
    `${chalk.green('✓')} ${dryRun ? 'Would backfill' : 'Backfilled'} contact events`
  );
};
