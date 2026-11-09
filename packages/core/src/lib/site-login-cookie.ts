import type { CookieOptions } from 'express';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import config from '#config/config';

function getSettings() {
  if (!config.siteLogin) {
    throw new Error('Site Login is not configured');
  }
  return config.siteLogin;
}

/**
 * Encrypt an ID token for the website login cookie: AES-256-GCM with a fresh
 * nonce, so equal tokens never produce equal cookies. The format
 * `base64(nonce).base64(ciphertext).base64(tag)` is what the website's edge
 * decrypts.
 */
export function encryptSiteLogin(idToken: string): string {
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getSettings().key, nonce);
  const ciphertext = Buffer.concat([
    cipher.update(idToken, 'utf8'),
    cipher.final(),
  ]);
  return [nonce, ciphertext, cipher.getAuthTag()]
    .map((b) => b.toString('base64'))
    .join('.');
}

// Domain separation from the cookie: a sealed refresh token never opens as a
// cookie value and vice versa, although both use the Site Login key
const REFRESH_TOKEN_AAD = Buffer.from('refresh-token');

/**
 * Encrypt the refresh token for the session store, so a dump of the session
 * table does not hand out long-lived IdP credentials
 */
export function sealRefreshToken(refreshToken: string): string {
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getSettings().key, nonce);
  cipher.setAAD(REFRESH_TOKEN_AAD);
  const ciphertext = Buffer.concat([
    cipher.update(refreshToken, 'utf8'),
    cipher.final(),
  ]);
  return [nonce, ciphertext, cipher.getAuthTag()]
    .map((b) => b.toString('base64'))
    .join('.');
}

/** @returns The refresh token, or null if the value is not a sealed one */
export function openRefreshToken(sealed: string): string | null {
  try {
    const [nonce, ciphertext, tag] = sealed
      .split('.')
      .map((part) => Buffer.from(part, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', getSettings().key, nonce);
    decipher.setAAD(REFRESH_TOKEN_AAD);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return null;
  }
}

/**
 * Cookie options for setting and clearing the website login cookie. Clearing
 * must use the same name, domain and path, otherwise browsers keep the cookie.
 */
export function siteLoginCookieOptions(): CookieOptions {
  const { cookieDomain, cookieMaxAge } = getSettings();
  return {
    domain: cookieDomain,
    path: '/',
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: 'lax',
    maxAge: cookieMaxAge * 1000,
    // The edge reads the value raw; Express would otherwise percent-encode + / =
    encode: String,
  };
}
