import { RateLimiterUtils } from '@beabee/core/utils';

/**
 * Clear the rate limiter cache.
 * This resets all in-memory rate limiters by incrementing the version counter.
 */
export async function clearRateLimiterCache(
  force: boolean = false
): Promise<void> {
  try {
    // Use NODE_ENV to determine dev mode instead of loading full config
    const isDev = process.env.NODE_ENV !== 'production';
    await RateLimiterUtils.clearCache({ force, dev: isDev });
    console.log('✅ Rate limiter cache cleared successfully');
    console.log(`📊 Current version: ${RateLimiterUtils.getVersion()}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Failed to clear rate limiter cache:', error.message);
    } else {
      console.error('❌ Failed to clear rate limiter cache:', error);
    }
    throw error;
  }
}
