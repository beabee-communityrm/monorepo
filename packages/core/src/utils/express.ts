import { RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

/**
 * Wrap an async Express handler so thrown errors propagate to `next()`.
 *
 * Generic over the route-param shape so call sites can recover the
 * `:param` → `string` typing that Express 5's wider `ParamsDictionary`
 * (`string | string[]`) otherwise loses. Other generics fall back to
 * Express's own `any` defaults to keep `req.query` / `req.body` usable
 * without per-route ceremony.
 */
export function wrapAsync<P = ParamsDictionary>(
  fn: RequestHandler<P>
): RequestHandler<P> {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
