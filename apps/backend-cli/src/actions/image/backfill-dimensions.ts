import { runApp } from '@beabee/core/server';
import { imageService } from '@beabee/core/services/ImageService';

import chalk from 'chalk';

/**
 * Backfill width/height S3 metadata for images uploaded before dimensions
 * were stored at upload time. Exits with a non-zero code if any image failed.
 * @param danger Make the changes; otherwise only report what would be done
 */
export const backfillDimensions = async (danger: boolean): Promise<void> => {
  await runApp(async () => {
    const { updated, skipped, failed } =
      await imageService.backfillImageDimensions(!danger);

    console.log(
      `${chalk.green('✓')} ${danger ? 'Updated' : 'Would update'} ${updated}, skipped ${skipped} (already have dimensions)`
    );

    if (failed > 0) {
      console.log(`${chalk.red('✗')} ${failed} failed, see logs for details`);
      process.exit(1);
    }
  });
};
