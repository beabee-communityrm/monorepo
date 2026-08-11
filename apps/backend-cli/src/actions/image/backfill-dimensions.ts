import { runApp } from '@beabee/core/server';
import { imageService } from '@beabee/core/services/ImageService';

import chalk from 'chalk';

/**
 * Backfill width/height S3 metadata for images uploaded before dimensions
 * were stored at upload time. Exits with a non-zero code if any image failed.
 * @param dryRun Only report what would be updated
 */
export const backfillDimensions = async (dryRun: boolean): Promise<void> => {
  await runApp(async () => {
    const { updated, skipped, failed } =
      await imageService.backfillImageDimensions(dryRun);

    console.log(
      `${chalk.green('✓')} ${dryRun ? 'Would update' : 'Updated'} ${updated}, skipped ${skipped} (already have dimensions)`
    );

    if (failed > 0) {
      console.log(`${chalk.red('✗')} ${failed} failed, see logs for details`);
      process.exit(1);
    }
  });
};
