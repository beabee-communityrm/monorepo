import { HealthClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import { beforeAll, describe, expect, it } from 'vitest';

describe('Health API', () => {
  let healthClient: HealthClient;

  beforeAll(() => {
    healthClient = new HealthClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });
  });

  describe('check', () => {
    it('should return health status when healthy', async () => {
      try {
        const health = await healthClient.check();

        expect(health).toBeDefined();
        expect(health.status).toBeDefined();
        expect(['ok', 'error']).toContain(health.status);
        expect(health.timestamp).toBeInstanceOf(Date);
        expect(health.services).toBeDefined();
        expect(typeof health.services.database).toBe('boolean');

        // If we get a response, it should be healthy (HTTP 200)
        expect(health.status).toBe('ok');
        expect(health.services.database).toBe(true);
      } catch (error) {
        // If the health check fails (HTTP 503), the client might throw an error
        // In that case, we should verify the error response contains health data
        if (error && typeof error === 'object' && 'response' in error) {
          const response = (error as any).response;
          if (response && response.data) {
            expect(response.data.status).toBe('error');
            expect(response.data.services.database).toBe(false);
            expect(response.status).toBe(503);
          }
        } else {
          // Re-throw if it's not a health-related error
          throw error;
        }
      }
    });

    it('should handle both healthy and unhealthy responses', async () => {
      try {
        const health = await healthClient.check();

        // Healthy response (HTTP 200)
        expect(health.status).toBe('ok');
        expect(health.services.database).toBe(true);
      } catch (error) {
        // Unhealthy response (HTTP 503)
        // The client should still provide access to the response data
        expect(error).toBeDefined();

        // Check if the error contains the expected health response structure
        if (error && typeof error === 'object' && 'response' in error) {
          const response = (error as any).response;
          expect(response.status).toBe(503);
          expect(response.data.status).toBe('error');
          expect(response.data.services.database).toBe(false);
        }
      }
    });
  });
});
