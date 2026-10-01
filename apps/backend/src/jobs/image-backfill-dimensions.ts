import { JobName } from '@beabee/beabee-common';
import { imageService } from '@beabee/core/services/ImageService';

import { DryRunJobArgsDto } from '#api/dto/JobDto';
import type { Job } from '#type/job';

/**
 * Stores width and height as S3 metadata for images uploaded before
 * dimensions were recorded at upload time
 */
export const imageBackfillDimensionsJob: Job<JobName.ImageBackfillDimensions> =
  {
    argsDto: DryRunJobArgsDto,
    async run(args, log) {
      const { updated, skipped, failed } =
        await imageService.backfillImageDimensions(args.dryRun);

      log.info(
        `${args.dryRun ? 'Would update' : 'Updated'} ${updated}, skipped ${skipped} (already have dimensions)`
      );

      if (failed > 0) {
        throw new Error(`${failed} images failed, see logs for details`);
      }
    },
  };
