import { LOGIN_CODES } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { NotFoundError, UnauthorizedError } from '@beabee/core/errors';
import {
  isOidcEnabled,
  refreshOidcLogin,
  revokeOidcRefreshToken,
} from '@beabee/core/lib/oidc';
import {
  encryptSiteLogin,
  openRefreshToken,
  sealRefreshToken,
  siteLoginCookieOptions,
} from '@beabee/core/lib/site-login-cookie';
import { Contact } from '@beabee/core/models';

import { CookieOptions, Request, Response } from 'express';

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
const FRESH_LOGIN_MAX_AGE = 2 * 60 * 60;

/** Whether the member logged in at the IdP in the last two hours */
export function isFreshOidcLogin(req: Request): boolean {
  const authTime = req.session.authTime;
  return !!authTime && authTime + FRESH_LOGIN_MAX_AGE >= Date.now() / 1000;
}

/**
 * Sensitive account changes need a login at the IdP from the last two
 * hours, so a session alone cannot make them. The client restarts the
 * login with `prompt=login` on this code and tries again.
 */
export function assertFreshOidcLogin(req: Request): void {
  if (!isFreshOidcLogin(req)) {
    throw new UnauthorizedError(LOGIN_CODES.FRESH_LOGIN_REQUIRED);
  }
}

/**
 * Login v2 keeps its session in a cookie without maxAge, so it ends with
 * the browser. This cookie has no maxAge either and mirrors that: as long
 * as the browser still sends it, it still sends the IdP's too.
 */
const IDP_SESSION_COOKIE = `${config.session}-idp`;
const IDP_SESSION_COOKIE_OPTIONS: CookieOptions = {
  ...config.cookie,
  httpOnly: true,
  sameSite: 'lax',
};

export function setIdpSessionCookie(res: Response): void {
  res.cookie(IDP_SESSION_COOKIE, '1', IDP_SESSION_COOKIE_OPTIONS);
}

export function clearIdpSessionCookie(res: Response): void {
  res.clearCookie(IDP_SESSION_COOKIE, IDP_SESSION_COOKIE_OPTIONS);
}

/**
 * Whether the browser still has the fresh login's session at the IdP: a
 * browser restart inside the fresh-login window drops the cookie too
 */
export function hasFreshIdpSession(req: Request): boolean {
  return !!req.cookies?.[IDP_SESSION_COOKIE] && isFreshOidcLogin(req);
}

/** How long a Login Grant can be used, in seconds */
const LOGIN_GRANT_MAX_AGE = 10 * 60;

/**
 * Allow one `directLogin` for the contact: beabee has verified them some
 * other way, such as the link in an email. Set after login(), which starts
 * a new session.
 */
export function grantDirectLogin(req: Request, contact: Contact): void {
  req.session.loginGrant = {
    contactId: contact.id,
    expiresAt: Date.now() / 1000 + LOGIN_GRANT_MAX_AGE,
  };
}

/** Use up the session's Login Grant, whether or not it is for this contact */
export function consumeDirectLoginGrant(
  req: Request,
  contact: Contact
): boolean {
  const grant = req.session.loginGrant;
  delete req.session.loginGrant;
  return (
    !!grant &&
    grant.contactId === contact.id &&
    grant.expiresAt >= Date.now() / 1000
  );
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

/**
 * Renew the website login's ID token with the session's refresh token. The
 * IdP rotates refresh tokens, so two requests refreshing at once leave one
 * with a spent token: that one re-reads the session, which by then holds
 * the winner's new token, and tries once more.
 * @returns The new ID token, or null when the session holds no refresh
 * token the IdP still accepts
 */
export async function refreshSiteLogin(req: Request): Promise<string | null> {
  const spent = req.session.refreshToken;
  if (!spent) return null;

  const idToken = await tryRefresh(req);
  if (idToken) return idToken;

  await new Promise<void>((resolve, reject) =>
    req.session.reload((err) => (err ? reject(err) : resolve()))
  );
  if (req.session.refreshToken && req.session.refreshToken !== spent) {
    return tryRefresh(req);
  }
  delete req.session.refreshToken;
  return null;
}

async function tryRefresh(req: Request): Promise<string | null> {
  const refreshToken =
    req.session.refreshToken && openRefreshToken(req.session.refreshToken);
  const tokens = refreshToken && (await refreshOidcLogin(refreshToken));
  if (!tokens) {
    delete req.session.refreshToken;
    return null;
  }
  req.session.refreshToken = sealRefreshToken(tokens.refreshToken);
  req.session.idToken = tokens.idToken;
  return tokens.idToken;
}

/** Revoke a session's sealed refresh token at the IdP, if it has one */
export async function revokeSiteLoginRefreshToken(
  sealed: string | undefined
): Promise<void> {
  const refreshToken = sealed && openRefreshToken(sealed);
  if (refreshToken) {
    await revokeOidcRefreshToken(refreshToken);
  }
}
