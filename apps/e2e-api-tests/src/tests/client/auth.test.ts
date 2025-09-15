import type { LoginData } from '@beabee/beabee-common';
import { AuthClient, ClientApiError } from '@beabee/client';
import {
  API_KEY,
  HOST,
  PATH,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
} from '@beabee/test-utils/vitest/env';

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('Auth API', () => {
  let authTokenClient: AuthClient;
  let authUserClient: AuthClient;

  beforeAll(() => {
    authTokenClient = new AuthClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });

    authUserClient = new AuthClient({
      host: HOST,
      path: PATH,
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
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      };
      await authUserClient.login(validLoginData);

      // Verify login was successful by checking auth info
      const authInfo = await authUserClient.info();
      expect(authInfo.contact?.email).toBe(TEST_USER_EMAIL);
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
        expect(error).toBeInstanceOf(ClientApiError);
        if (error instanceof ClientApiError) {
          expect(error.httpCode).toBe(401);
        }
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
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      const authInfo = await authUserClient.info();
      expect(authInfo.method).toBe('user');
      expect(authInfo.contact).toBeDefined();
      expect(authInfo.contact?.email).toBe(TEST_USER_EMAIL);
      expect(authInfo.roles).toBeDefined();
      expect(Array.isArray(authInfo.roles)).toBe(true);
    });
  });

  describe('logout (user session)', () => {
    it('should clear user authentication state after logout', async () => {
      // First login
      await authUserClient.login({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
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
