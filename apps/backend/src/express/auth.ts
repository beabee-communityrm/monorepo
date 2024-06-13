import { Request, Response } from "express";
import { getNextParam } from "#express";
import { AuthenticationStatus } from "@beabee/core";
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
