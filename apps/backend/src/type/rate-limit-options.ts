import type { IRateLimiterOptions } from 'rate-limiter-flexible';

/**
 * Configuration options for a single rate limiter (e.g., for guests or users).
 * Aligns with IRateLimiterOptions from rate-limiter-flexible.
 */
export type RateLimitConfig = Partial<IRateLimiterOptions>;

/**
 * Options for the @RateLimit decorator to define separate limits
 * for guests (identified by IP) and authenticated users (identified by ID).
 */
export interface RateLimitOptions {
  guest: RateLimitConfig; // Uses RateLimitConfig which maps to Partial<IRateLimiterOptions>
  user: RateLimitConfig; // Uses RateLimitConfig which maps to Partial<IRateLimiterOptions>
}
