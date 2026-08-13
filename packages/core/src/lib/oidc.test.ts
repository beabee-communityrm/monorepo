import { describe, expect, it } from 'vitest';

import config from '#config/config';

import { isOidcEnabled } from './oidc';

describe('isOidcEnabled', () => {
  it('reflects whether an OIDC issuer is configured', () => {
    const original = config.oidc.issuer;
    try {
      config.oidc.issuer = '';
      expect(isOidcEnabled()).toBe(false);

      config.oidc.issuer = 'https://idp.example.com';
      expect(isOidcEnabled()).toBe(true);
    } finally {
      config.oidc.issuer = original;
    }
  });
});
