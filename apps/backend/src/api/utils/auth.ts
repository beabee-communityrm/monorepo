import { LOGIN_CODES } from '@beabee/beabee-common';
import { NotFoundError, UnauthorizedError } from '@beabee/core/errors';
import { isOidcEnabled } from '@beabee/core/lib/oidc';
import { Contact } from '@beabee/core/models';

import { Request } from 'express';

/** Password, MFA and reset endpoints don't exist on OIDC Login instances */
export function assertPasswordAuthEnabled(): void {
  if (isOidcEnabled()) {
    throw new NotFoundError();
  }
}

/** The browser-facing OIDC routes don't exist on Local Login instances */
export function assertOidcAuthEnabled(): void {
  if (!isOidcEnabled()) {
    throw new NotFoundError();
  }
}

/** How long a login at the IdP counts as fresh, in seconds */
const FRESH_LOGIN_MAX_AGE = 5 * 60;

/**
 * Sensitive account changes need a login at the IdP from the last few
 * minutes, so a session alone cannot make them. The client restarts the
 * login with `prompt=login` on this code and tries again.
 */
export function assertFreshOidcLogin(req: Request): void {
  const authTime = req.session.authTime;
  if (!authTime || authTime + FRESH_LOGIN_MAX_AGE < Date.now() / 1000) {
    throw new UnauthorizedError(LOGIN_CODES.FRESH_LOGIN_REQUIRED);
  }
}

export function login(req: Request, contact: Contact): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    req.login(contact, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
