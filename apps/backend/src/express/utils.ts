import { AuthInfo } from "@beabee/core";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { Contact } from "@beabee/models";

export function isValidNextUrl(url: string): boolean {
  return /^\/([^/]|$)/.test(url);
}

export function userToAuth(user: Express.User): AuthInfo {
  return {
    method: "user",
    entity: user,
    roles: user.activeRoles
  };
}

export interface RequestWithUser extends Request {
  user: Express.User & Contact;
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
    req.headers["user-agent"] || ""
  );
}

export function getNextParam(url: string): string {
  return isValidNextUrl(url) ? "?next=" + encodeURIComponent(url) : "";
}
