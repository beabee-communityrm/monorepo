import { runApp } from '@beabee/core/server';
import { optionsService } from '@beabee/core/services';
import { rateLimiter } from '@beabee/core/utils';

/**
 * Clear the rate limiter cache.
 * This resets all in-memory rate limiters by incrementing the version counter.
 */
export async function clearRateLimiterCache(
  force: boolean = false
): Promise<void> {
  await runApp(async () => {
    try {
      // Initialize options service
      await optionsService.reload();

      const oldVersion = rateLimiter.getVersion();
      await rateLimiter.clearCache({ force });
      const newVersion = rateLimiter.getVersion();

      console.log('✅ Rate limiter cache cleared successfully');
      console.log(`📊 Version: ${oldVersion} → ${newVersion}`);

      if (rateLimiter.isNearReset()) {
        console.log(
          `⚠️  Warning: Version is close to reset threshold (${rateLimiter.getMaxVersion()})`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Failed to clear rate limiter cache:', error.message);
      } else {
        console.error('❌ Failed to clear rate limiter cache:', error);
      }
      throw error;
    }
  });
}
