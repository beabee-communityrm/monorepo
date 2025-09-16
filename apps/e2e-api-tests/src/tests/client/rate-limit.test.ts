import { BeabeeClient, ClientApiError } from '@beabee/client';
import { createTestFile } from '@beabee/test-utils/node';
import {
  HOST,
  PATH,
  TEST_RATE_LIMIT_USER_EMAIL,
  TEST_RATE_LIMIT_USER_PASSWORD,
} from '@beabee/test-utils/vitest/env';

import { resolve } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FIXTURE_PATH } from '../../env';

describe('Upload API', () => {
  describe('Rate Limits', () => {
    let client: BeabeeClient;

    beforeEach(async () => {
      // Create a guest client (unauthenticated)
      client = new BeabeeClient({
        host: HOST,
        path: PATH,
      });
    });

    // Add afterEach to logout after every test in this suite
    afterEach(async () => {
      try {
        await client.auth.logout();
      } catch (error) {
        // Ignore logout errors, maybe the user wasn't logged in
      }
    });

    describe('Rate Limit Tests', () => {
      it('should enforce rate limits for guest users uploading images', async () => {
        const svgPath = resolve(FIXTURE_PATH, '400x600.svg');
        const svgFile = createTestFile(svgPath, 'image/svg+xml');

        // Guest users are limited to 5 requests per hour
        // We'll make 5 requests, they should all succeed
        for (let i = 0; i < 5; i++) {
          const response = await client.upload.image.uploadFile(svgFile);
          expect(response).toBeDefined();
          expect(response.id).toBeDefined();
        }

        // The 6th request should exceed the rate limit
        try {
          await client.upload.image.uploadFile(svgFile);
          // If we reach this point, the test should fail
          expect(true).toBe(false);
        } catch (error) {
          console.error(
            'should enforce rate limits for guest users uploading images',
            error
          );
          expect(error).toBeInstanceOf(ClientApiError);
          if (error instanceof ClientApiError) {
            expect(error.httpCode).toBe(429);
            expect(error.code).toBe('TOO_MANY_REQUESTS');
          }
        }
      });

      it('should allow authenticated users to upload documents', async () => {
        // Log in the user specifically for this test
        await client.auth.login({
          email: TEST_RATE_LIMIT_USER_EMAIL,
          password: TEST_RATE_LIMIT_USER_PASSWORD,
        });

        const pdfPath = resolve(FIXTURE_PATH, 'Lorem-Ipsum.pdf');
        const pdfFile = createTestFile(pdfPath, 'application/pdf');

        // Authenticated users should be able to make more requests (up to 50/hour)
        // We'll test with just 6 requests, which should be well below the limit
        for (let i = 0; i < 6; i++) {
          const response = await client.upload.document.uploadFile(pdfFile);
          expect(response).toBeDefined();
          expect(response.id).toBeDefined();
        }
      });
    });
  });
});
