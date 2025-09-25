import { config } from '@beabee/core/config';
import { TooManyRequestsError } from '@beabee/core/errors';
import { RateLimiterService } from '@beabee/core/services';
import type { RateLimitOptions } from '@beabee/core/type';

import type { NextFunction, Request, Response } from 'express';
import { RateLimiterRes } from 'rate-limiter-flexible';

/**
 * Logically resets rate limiting for all in-memory limiters.
 * Delegates to the core RateLimiterService.
 *
 * @param options.force - If true, the cache will be cleared even if not in dev mode.
 */
export function clearRateLimiterCache(options: { force?: boolean } = {}) {
  RateLimiterService.clearCache({ ...options, dev: config.dev });
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
  const limiters = RateLimiterService.getLimiters(options);

  // Return the actual middleware function
  return function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const currentUser = req.user;
    let keyBase: string;
    let limiter;

    if (currentUser) {
      keyBase = currentUser.id.toString();
      limiter = limiters.user;
    } else {
      keyBase = req.ip || 'unknown_ip';
      limiter = limiters.guest;
    }

    const key = RateLimiterService.generateKey(keyBase);

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
          next(new Error('Internal server error during rate limiting.'));
        }
      });
  };
}
