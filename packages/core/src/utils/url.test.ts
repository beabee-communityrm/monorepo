import { describe, expect, it } from 'vitest';

import { isValidNextUrl } from './url';

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
