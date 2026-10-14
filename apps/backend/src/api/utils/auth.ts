import config from '@beabee/core/config';
import { NotFoundError } from '@beabee/core/errors';
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
