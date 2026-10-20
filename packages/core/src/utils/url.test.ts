import { describe, expect, it } from 'vitest';

import { isAllowedReturnUrl, isValidNextUrl } from './url';

describe('isValidNextUrl', () => {
  it.each([
    '/',
    '/x',
    '/profile/account?welcomeMessage=true',
    '/%2F%2Fevil.com',
  ])('accepts %s', (url) => {
    expect(isValidNextUrl(url)).toBe(true);
  });

  it.each([
    '',
    'profile',
    '//evil.com',
    'https://evil.com',
    'javascript:alert(1)',
    '/\\evil.com',
    '/x\r\nLocation: https://evil.com',
  ])('rejects %s', (url) => {
    expect(isValidNextUrl(url)).toBe(false);
  });

  it('keeps a dot-dot path on this host', () => {
    expect(isValidNextUrl('/..//evil.com')).toBe(true);
    expect(new URL('/..//evil.com', 'https://beabee.example').host).toBe(
      'beabee.example'
    );
  });
});

describe('isAllowedReturnUrl', () => {
  const origins = [
    'https://www.example.org',
    'https://stage.example.org',
    'http://localhost:3000',
  ];

  it.each([
    'https://www.example.org',
    'https://www.example.org/',
    'https://stage.example.org/article/1?x=y#top',
    'http://localhost:3000/x',
  ])('accepts %s', (url) => {
    expect(isAllowedReturnUrl(url, origins)).toBe(true);
  });

  it.each([
    '',
    '/',
    'www.example.org/',
    'http://www.example.org/',
    'https://example.org/',
    'https://evil.example.org/',
    'https://www.example.org.evil.com/',
    'https://www.example.org:8443/',
    'https://user:pass@www.example.org/',
    'https://www.example.org@evil.com/',
    'https://www.example.org/x\r\nLocation: https://evil.com',
  ])('rejects %s', (url) => {
    expect(isAllowedReturnUrl(url, origins)).toBe(false);
  });

  it('rejects everything without origins', () => {
    expect(isAllowedReturnUrl('https://www.example.org/', [])).toBe(false);
  });
});
