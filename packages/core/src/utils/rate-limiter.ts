import { IRateLimiterOptions, RateLimiterMemory } from 'rate-limiter-flexible';

import type { RateLimitOptions } from '../type';
import { optionsService } from '../services/OptionsService';

export { RateLimiterRes } from 'rate-limiter-flexible';

// Defaults merged with provided options
const defaultGuestLimit: IRateLimiterOptions = {
  points: 10,
  duration: 60 * 60,
  keyPrefix: 'rate_limit_guest_default',
};

const defaultUserLimit: IRateLimiterOptions = {
  points: 100,
  duration: 60 * 60,
  keyPrefix: 'rate_limit_user_default',
};

// Cache limiter instances based on final config string
const limiterCache = new Map<
  string,
  { guest: RateLimiterMemory; user: RateLimiterMemory }
>();

/**
 * Rate Limiter utility functions for managing in-memory rate limiting.
 * Provides core functionality that can be used by both backend and CLI.
 */
export const RateLimiterUtils = {
  /**
   * Logically resets rate limiting for all in-memory limiters.
   *
   * Increments a persistent version that is appended to each consume key.
   * This effectively starts using a new key namespace (akin to changing
   * the `keyPrefix` in rate-limiter-flexible), so previously consumed
   * keys no longer apply without recreating limiter instances.
   *
   * The version is stored persistently in the database via OptionsService,
   * allowing cache clearing to work across different processes (backend, CLI).
   *
   * @param options.force - If true, the cache will be cleared even if not in dev mode.
   * @param options.dev - Whether we're in development mode (defaults to NODE_ENV !== 'production').
   */
  async clearCache(options: { force?: boolean; dev?: boolean } = {}): Promise<void> {
    const isDev = options.dev ?? process.env.NODE_ENV !== 'production';

    if (!isDev && !options.force) {
      throw new Error('Clear rate limiter cache is not allowed');
    }

    // Get current version from database
    const currentVersion = parseInt(optionsService.get('rate-limiter-version').value, 10);
    
    // Increment and save to database
    await optionsService.set('rate-limiter-version', currentVersion + 1);
  },

  /**
   * Get or create limiter instances for the given options.
   * Uses caching to avoid recreating limiters with identical configurations.
   */
  getLimiters(options: RateLimitOptions): {
    guest: RateLimiterMemory;
    user: RateLimiterMemory;
  } {
    // Merge defaults with provided options
    const guestConfig = { ...defaultGuestLimit, ...(options.guest || {}) };
    const userConfig = { ...defaultUserLimit, ...(options.user || {}) };

    // Use unique prefixes if provided in options, otherwise use defaults
    guestConfig.keyPrefix =
      options.guest?.keyPrefix ||
      `rate_limit_guest_${guestConfig.points}_${guestConfig.duration}`;
    userConfig.keyPrefix =
      options.user?.keyPrefix ||
      `rate_limit_user_${userConfig.points}_${userConfig.duration}`;

    const cacheKey = JSON.stringify({ guest: guestConfig, user: userConfig });

    if (!limiterCache.has(cacheKey)) {
      limiterCache.set(cacheKey, {
        guest: new RateLimiterMemory(guestConfig),
        user: new RateLimiterMemory(userConfig),
      });
    }
    return limiterCache.get(cacheKey)!;
  },

  /**
   * Generate a rate limit key with the current version suffix.
   * This allows for logical cache resets without recreating limiter instances.
   */
  generateKey(baseKey: string): string {
    const version = parseInt(optionsService.get('rate-limiter-version').value, 10);
    return `${version}:${baseKey}`;
  },

  /**
   * Get the current version number for debugging purposes.
   */
  getVersion(): number {
    return parseInt(optionsService.get('rate-limiter-version').value, 10);
  },
};
