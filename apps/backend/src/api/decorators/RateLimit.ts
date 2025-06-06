import type { Request, Response, NextFunction } from 'express';
import {
  RateLimiterMemory,
  RateLimiterRes,
  IRateLimiterOptions,
} from 'rate-limiter-flexible';
import { TooManyRequestsError } from '@beabee/core/errors';
import type { RateLimitOptions } from '../../type';

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

function getLimiters(options: RateLimitOptions): {
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
    console.log(`Creating rate limiters for key: ${cacheKey}`); // Debug log
    limiterCache.set(cacheKey, {
      guest: new RateLimiterMemory(guestConfig),
      user: new RateLimiterMemory(userConfig),
    });
  }
  return limiterCache.get(cacheKey)!;
}

/**
 * Applies rate limiting to the decorated controller method or class.
 *
 * Returns an Express middleware function configured with the provided options.
 *
 * @param options Configuration for guest and user rate limits.
 */
export function RateLimit(options: RateLimitOptions) {
  // Get or create the specific limiter instances for these options
  const limiters = getLimiters(options);

  // Return the actual middleware function
  return function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const currentUser = req.user;
    let key: string;
    let limiter: RateLimiterMemory;

    if (currentUser) {
      key = currentUser.id.toString();
      limiter = limiters.user;
    } else {
      key = req.ip || 'unknown_ip';
      limiter = limiters.guest;
    }

    limiter
      .consume(key)
      .then(() => {
        next();
      })
      .catch((rejRes) => {
        if (rejRes instanceof RateLimiterRes) {
          const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
          res.set('Retry-After', String(retryAfter));
          // Use routing-controllers error handling by throwing the error
          next(
            new TooManyRequestsError({
              message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            })
          );
        } else {
          console.error('Rate limiting error:', rejRes);
          next(new Error('Internal server error during rate limiting.'));
        }
      });
  };
}
