import crypto from "crypto";
import { Request, Response } from "express";
import { getNextParam } from "@beabee/core/utils/url";

export enum AuthenticationStatus {
  LOGGED_IN = 1,
  NOT_LOGGED_IN = 0,
  NOT_MEMBER = -1,
  NOT_ADMIN = -2,
  REQUIRES_2FA = -3
}

export function generateCode(): string {
  return crypto.randomBytes(10).toString("hex");
}

/**
 * Checks the user is logged in and activated.
 * @param req
 * @returns
 */
export function loggedIn(req: Request): AuthenticationStatus {
  // Is the user logged in?
  if (req.isAuthenticated() && req.user) {
    return AuthenticationStatus.LOGGED_IN;
  } else {
    return AuthenticationStatus.NOT_LOGGED_IN;
  }
}

/**
 * Checks if the user has an active admin or superadmin privilege
 * @param req
 * @returns
 */
export function canAdmin(req: Request): AuthenticationStatus {
  // Check user is logged in
  const status = loggedIn(req);
  if (status != AuthenticationStatus.LOGGED_IN) {
    return status;
  } else if (req.user?.hasRole("admin")) {
    return AuthenticationStatus.LOGGED_IN;
  }
  return AuthenticationStatus.NOT_ADMIN;
}

/**
 * Checks if the user has an active superadmin privilege
 * @param req
 * @returns
 */
export function canSuperAdmin(req: Request): AuthenticationStatus {
  // Check user is logged in
  const status = loggedIn(req);
  if (status != AuthenticationStatus.LOGGED_IN) {
    return status;
  } else if (req.user?.hasRole("superadmin")) {
    return AuthenticationStatus.LOGGED_IN;
  }
  return AuthenticationStatus.NOT_ADMIN;
}

export function handleNotAuthed(
  status: AuthenticationStatus,
  req: Request,
  res: Response
): void {
  const nextUrl = req.method === "GET" ? getNextParam(req.originalUrl) : "";

  switch (status) {
    case AuthenticationStatus.REQUIRES_2FA:
      res.redirect("/otp" + nextUrl);
      return;
    default:
      req.flash("error", "login-required");
      res.redirect("/login" + nextUrl);
      return;
  }
}
//
/**
 * Checks password meets requirements.
 * The requirements are:
 * - At least 8 characters
 * - At least 1 number
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * @param password
 * @returns
 */
export function passwordRequirements(password: string): string | true {
  if (!password) return "password-err-length";

  if (password.length < 8) return "password-err-length";

  if (password.match(/\d/g) === null) return "password-err-number";

  if (password.match(/[A-Z]/g) === null) return "password-err-letter-up";

  if (password.match(/[a-z]/g) === null) return "password-err-letter-low";

  return true;
}
