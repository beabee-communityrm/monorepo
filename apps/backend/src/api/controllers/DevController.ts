import config from '@beabee/core/config';

import { JsonController, NotFoundError, Post } from 'routing-controllers';

import { clearRateLimiterCache } from '../decorators/RateLimit';

/**
 * Development-only controller for testing and debugging purposes.
 * All endpoints are only available in dev mode.
 */
@JsonController('/dev')
export class DevController {
  /**
   * Clear the rate limiter cache.
   * Only available in development mode.
   */
  @Post('/clear-rate-limiter-cache')
  async clearRateLimiterCache(): Promise<{ message: string }> {
    // IMPORTANT: This is only available in dev mode
    if (!config.dev) {
      throw new NotFoundError();
    }

    clearRateLimiterCache();
    return { message: 'Rate limiter cache cleared successfully' };
  }
}
