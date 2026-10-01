import { JobName } from '@beabee/beabee-common';
import { rateLimiter } from '@beabee/core/utils';

import { RateLimiterClearJobArgsDto } from '#api/dto/JobDto';
import type { Job } from '#type/job';

/** Resets all in-memory rate limiters by bumping the shared version option */
export const rateLimiterClearJob: Job<JobName.RateLimiterClear> = {
  argsDto: RateLimiterClearJobArgsDto,
  async run(args, log) {
    const oldVersion = rateLimiter.getVersion();
    await rateLimiter.clearCache(args.force ? { force: true } : {});
    log.info(
      `Rate limiter cache cleared, version ${oldVersion} → ${rateLimiter.getVersion()}`
    );

    if (rateLimiter.isNearReset()) {
      log.warning(
        `Version is close to the reset threshold (${rateLimiter.getMaxVersion()})`
      );
    }
  },
};
