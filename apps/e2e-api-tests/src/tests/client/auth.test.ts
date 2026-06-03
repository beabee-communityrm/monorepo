import type { LoginData } from '@beabee/beabee-common';
import { AuthClient, UnauthorizedError } from '@beabee/client';

import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  api,
  testUser,
} from '../../../../../test-utils/fixtures/test-data.json';

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
    it('should successfully login with user credentials', async () => {
      const validLoginData: LoginData = {
        email: testUser.email,
        password: testUser.password,
      };
      await authUserClient.login(validLoginData);

      // Verify login was successful by checking auth info
      const authInfo = await authUserClient.info();
      expect(authInfo.contact?.email).toBe(testUser.email);
      expect(authInfo.method).toBe('user');
    });

    it('should reject invalid user credentials', async () => {
      const invalidLoginData: LoginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
        token: '',
      };

      try {
        await authUserClient.login(invalidLoginData);
        // If we reach this point, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedError);
      }
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
      await authUserClient.login({
        email: testUser.email,
        password: testUser.password,
      });

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
      await authUserClient.login({
        email: testUser.email,
        password: testUser.password,
      });

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
