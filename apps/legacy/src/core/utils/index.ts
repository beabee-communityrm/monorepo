import { AuthInfo } from '@beabee/core/type';

import { NextFunction, Request, RequestHandler, Response } from 'express';

export function userToAuth(user: Express.User): AuthInfo {
  return {
    method: 'user',
    contact: user,
    roles: user.activeRoles,
  };
}

export interface RequestWithUser extends Request {
  user: Express.User;
}

export function hasUser(
  fn: (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => void | Promise<void>
): RequestHandler {
  return (req, res, next) => {
    if (req.user) {
      return fn(req as RequestWithUser, res, next);
    } else {
      next();
    }
  };
}

export function isSocialScraper(req: Request): boolean {
  return /^(Twitterbot|facebookexternalhit)/.test(
    req.headers['user-agent'] || ''
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createDateTime(date: string, time: string): Date;
export function createDateTime(
  date: string | undefined,
  time: string | undefined
): Date | null;
export function createDateTime(
  date: string | undefined,
  time: string | undefined
): Date | null {
  return date && time ? new Date(date + 'T' + time) : null;
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
