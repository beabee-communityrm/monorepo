import { ContributionPeriod } from "@beabee/beabee-common";
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

export function getActualAmount(
  amount: number,
  period: ContributionPeriod
): number {
  // TODO: fix this properly
  return Math.round(amount * (period === ContributionPeriod.Annually ? 12 : 1));
}

export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1] || null;
  }
  return null;
}
