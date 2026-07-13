import { AuthClient } from '@beabee/client';
import { api, testUser } from '@beabee/test-utils/test-data';

import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { devLogin } from '#utils/auth.ts';

describe('Auth API', () => {
  let authTokenClient: AuthClient;
  let authUserClient: AuthClient;

  beforeAll(() => {
    authTokenClient = new AuthClient({
      host: api.host,
      path: api.path,
      token: testUser.apiKey,
    });

    authUserClient = new AuthClient({
      host: api.host,
      path: api.path,
    });
  });

  // Cleanup after each test
  afterEach(async () => {
    try {
      await authUserClient.logout();
    } catch (error) {
      // Ignore logout errors in afterEach
    }
  });

  describe('login (user authentication)', () => {
    it('should successfully login as a user', async () => {
      await devLogin(authUserClient, testUser.email);

      // Verify login was successful by checking auth info
      const authInfo = await authUserClient.info();
      expect(authInfo.contact?.email).toBe(testUser.email);
      expect(authInfo.method).toBe('user');
    });

    it('should not login unknown users', async () => {
      await devLogin(authUserClient, 'nonexistent@example.com');

      const authInfo = await authUserClient.info();
      expect(authInfo.method).toBe('none');
      expect(authInfo.contact).toBeUndefined();
    });
  });

  describe('info (authentication status)', () => {
    it('should return api-key authentication status for token client', async () => {
      const authInfo = await authTokenClient.info();
      expect(authInfo.method).toBe('api-key');
      expect(authInfo.contact).toBeUndefined();
    });

    it('should return user authentication status after login', async () => {
      // Login first
      await devLogin(authUserClient, testUser.email);

      const authInfo = await authUserClient.info();
      expect(authInfo.method).toBe('user');
      expect(authInfo.contact).toBeDefined();
      expect(authInfo.contact?.email).toBe(testUser.email);
      expect(authInfo.roles).toBeDefined();
      expect(Array.isArray(authInfo.roles)).toBe(true);
    });
  });

  describe('logout (user session)', () => {
    it('should clear user authentication state after logout', async () => {
      // First login
      await devLogin(authUserClient, testUser.email);

      // Verify logged in state
      let authInfo = await authUserClient.info();
      expect(authInfo.method).toBe('user');

      // Logout
      await authUserClient.logout();

      // Verify logged out state
      authInfo = await authUserClient.info();
      expect(authInfo.method).toBe('none');
      expect(authInfo.contact).toBeUndefined();
    });
  });
});
