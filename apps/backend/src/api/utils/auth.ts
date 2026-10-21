import { LOGIN_CODES } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { NotFoundError, UnauthorizedError } from '@beabee/core/errors';
import { isOidcEnabled } from '@beabee/core/lib/oidc';
import {
  encryptSiteLogin,
  siteLoginCookieOptions,
} from '@beabee/core/lib/site-login-cookie';
import { Contact } from '@beabee/core/models';

import { Request, Response } from 'express';

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

/** Whether the member logged in at the IdP in the last few minutes */
export function isFreshOidcLogin(req: Request): boolean {
  const authTime = req.session.authTime;
  return !!authTime && authTime + FRESH_LOGIN_MAX_AGE >= Date.now() / 1000;
}

/**
 * Sensitive account changes need a login at the IdP from the last few
 * minutes, so a session alone cannot make them. The client restarts the
 * login with `prompt=login` on this code and tries again.
 */
export function assertFreshOidcLogin(req: Request): void {
  if (!isFreshOidcLogin(req)) {
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

/** Website login cookie on the parent domain; no-op without Site Login */
export function setSiteLoginCookie(res: Response, idToken: string): void {
  if (config.siteLogin) {
    res.cookie(
      config.siteLogin.cookieName,
      encryptSiteLogin(idToken),
      siteLoginCookieOptions()
    );
  }
}

export function clearSiteLoginCookie(res: Response): void {
  if (config.siteLogin) {
    res.clearCookie(config.siteLogin.cookieName, siteLoginCookieOptions());
  }
}
