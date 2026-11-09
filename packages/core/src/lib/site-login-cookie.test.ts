import { createDecipheriv } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

const key = Buffer.alloc(32, 7);

vi.mock('#config/config', () => ({
  default: {
    cookie: { secure: true },
    siteLogin: {
      cookieName: '__Secure-login',
      cookieDomain: 'example.org',
      cookieMaxAge: 3600,
      key,
    },
  },
}));

const { encryptSiteLogin, siteLoginCookieOptions } =
  await import('./site-login-cookie');

function decrypt(value: string): string {
  const [nonce, ciphertext, tag] = value
    .split('.')
    .map((part) => Buffer.from(part, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}

describe('encryptSiteLogin', () => {
  it('round-trips the token through AES-256-GCM', () => {
    expect(decrypt(encryptSiteLogin('id-token'))).toBe('id-token');
  });

  it('produces nonce, ciphertext and tag as three base64 parts', () => {
    const parts = encryptSiteLogin('id-token').split('.');
    expect(parts).toHaveLength(3);
    expect(Buffer.from(parts[0], 'base64')).toHaveLength(12);
    expect(Buffer.from(parts[2], 'base64')).toHaveLength(16);
  });

  it('never encrypts the same token to the same value', () => {
    expect(encryptSiteLogin('id-token')).not.toBe(encryptSiteLogin('id-token'));
  });
});

describe('siteLoginCookieOptions', () => {
  it('sets a parent-domain cookie the edge can read raw', () => {
    expect(siteLoginCookieOptions()).toEqual({
      domain: 'example.org',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 3600000,
      encode: String,
    });
  });
});
