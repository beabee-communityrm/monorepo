import { RequestHandler } from "express";

export function wrapAsync(fn: RequestHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Normalize an email address to ensure emails are compared in a
 * case-insensitive way
 *
 * @param email
 * @returns Normalized email address
 */
export function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidNextUrl(url: string): boolean {
  return /^\/([^/]|$)/.test(url);
}

export function getNextParam(url: string): string {
  return isValidNextUrl(url) ? "?next=" + encodeURIComponent(url) : "";
}
