import type { GetPaymentsQuery } from '@beabee/beabee-common';
import { PaymentClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import { beforeAll, describe, expect, it } from 'vitest';

describe('PaymentClient', () => {
  let paymentClient: PaymentClient;

  beforeAll(() => {
    paymentClient = new PaymentClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });
  });

  describe('list', () => {
    it('lists payments without filters', async () => {
      const { items, count } = await paymentClient.list();

      expect(Array.isArray(items)).toBe(true);
      expect(count).toBeGreaterThanOrEqual(0);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toMatchObject({
        amount: expect.any(Number),
        status: expect.any(String),
        chargeDate: expect.any(Date),
      });
    });

    it('lists payments with contact relation', async () => {
      const { items } = await paymentClient.list({}, ['contact']);

      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty('contact');
      if (items[0].contact) {
        expect(items[0].contact).toMatchObject({
          id: expect.any(String),
          displayName: expect.any(String),
        });
      }
    });

    // Skip status test as we can't control payment status through CLI
    it.skip('filters payments by status', async () => {
      const testStatus = 'pending';
      const query: GetPaymentsQuery = {
        rules: {
          condition: 'AND',
          rules: [
            {
              field: 'status',
              operator: 'equal',
              value: [testStatus],
            },
          ],
        },
      };

      const { items } = await paymentClient.list(query);

      expect(items.length).toBeGreaterThan(0);
      expect(items.every((item) => item.status === testStatus)).toBe(true);
    });

    // Skip date range test as we can't set charge date through CLI
    it.skip('filters payments by charge date range', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const query: GetPaymentsQuery = {
        rules: {
          condition: 'AND',
          rules: [
            {
              field: 'chargeDate',
              operator: 'between',
              value: [startDate.toISOString(), endDate.toISOString()],
            },
          ],
        },
      };

      const { items } = await paymentClient.list(query);

      expect(items.length).toBeGreaterThan(0);
      items.forEach((item) => {
        expect(item.chargeDate.getTime()).toBeGreaterThanOrEqual(
          startDate.getTime()
        );
        expect(item.chargeDate.getTime()).toBeLessThanOrEqual(
          endDate.getTime()
        );
      });
    });

    it('paginates payments', async () => {
      const page1 = await paymentClient.list({ limit: 5, offset: 0 });
      const page2 = await paymentClient.list({ limit: 5, offset: 5 });

      expect(page1.items.length).toBe(5);
      expect(page2.items.length).toBe(5);
    });
  });
});
