import { GetNoticesQuery, UpdateNoticeData } from '@beabee/beabee-common';
import { BeabeeClient, NoticeClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { testNotice, testNoticeUpdate } from '../../fixtures/notices.js';

describe('Notice API', () => {
  let client: BeabeeClient;
  let noticeClient: NoticeClient;
  let testNoticeId: string;

  beforeAll(() => {
    client = new BeabeeClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });
    noticeClient = client.notice;
  });

  describe('create', () => {
    it('should create a new notice', async () => {
      const notice = await noticeClient.create(testNotice);

      expect(notice).toMatchObject({
        name: testNotice.name,
        text: testNotice.text,
      });
      expect(notice.id).toBeDefined();
      expect(notice.createdAt).toBeInstanceOf(Date);
      expect(notice.updatedAt).toBeInstanceOf(Date);
      expect(notice.starts).toBeInstanceOf(Date);
      expect(notice.expires).toBeInstanceOf(Date);

      // Store ID for later tests
      testNoticeId = notice.id;
    });

    it('should throw error when creating notice with invalid data', async () => {
      const invalidNotice: any = {
        foo: 'bar', // Invalid field
      };

      await expect(noticeClient.create(invalidNotice)).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list all notices', async () => {
      // Create another notice for testing list
      await noticeClient.create({
        ...testNotice,
        name: 'Second Test Notice',
      });

      const { items, total } = await noticeClient.list();

      expect(Array.isArray(items)).toBe(true);
      expect(total).toBeGreaterThan(0);
      expect(items.length).toBeGreaterThan(0);

      const firstNotice = items[0];
      expect(firstNotice).toHaveProperty('id');
      expect(firstNotice).toHaveProperty('name');
      expect(firstNotice.createdAt).toBeInstanceOf(Date);

      const createdNotice = items.find((notice) => notice.id === testNoticeId);
      expect(createdNotice).toBeDefined();
      expect(createdNotice?.text).toBe(testNotice.text);
    });

    it('should filter notices by query parameters', async () => {
      const query: GetNoticesQuery = {
        limit: 1,
        rules: {
          condition: 'AND',
          rules: [
            {
              field: 'name',
              operator: 'equal',
              value: [testNotice.name],
            },
          ],
        },
      };

      const { items } = await noticeClient.list(query);

      expect(items.length).toBe(1);
      expect(items[0].name).toContain(testNotice.name);
    });
  });

  describe('get', () => {
    it('should get a notice by id', async () => {
      const notice = await noticeClient.get(testNoticeId);

      expect(notice).toMatchObject({
        id: testNoticeId,
        name: testNotice.name,
        text: testNotice.text,
      });
      expect(notice.createdAt).toBeInstanceOf(Date);
      expect(notice.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error when getting non-existent notice', async () => {
      await expect(noticeClient.get('non-existent-id')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an existing notice', async () => {
      const updatedNotice = await noticeClient.update(
        testNoticeId,
        testNoticeUpdate
      );

      expect(updatedNotice).toMatchObject({
        id: testNoticeId,
        name: testNotice.name, // Name should not be updated
        text: testNoticeUpdate.text, // Text should be updated
      });
      expect(updatedNotice.updatedAt.getTime()).toBeGreaterThan(
        updatedNotice.createdAt.getTime()
      );
    });

    it('should throw error when updating non-existent notice', async () => {
      const updateData = {
        name: 'Updated notice',
        text: 'Updated notice',
        expires: new Date(),
      };

      await expect(
        noticeClient.update('non-existent-id', updateData)
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete an existing notice', async () => {
      await noticeClient.delete(testNoticeId);

      // Verify notice is deleted
      await expect(noticeClient.get(testNoticeId)).rejects.toThrow();

      // Verify it's not in the list
      const { items } = await noticeClient.list();
      const deletedNotice = items.find((notice) => notice.id === testNoticeId);
      expect(deletedNotice).toBeUndefined();
    });

    it('should throw error when deleting non-existent notice', async () => {
      await expect(noticeClient.delete('non-existent-id')).rejects.toThrow();
    });
  });
});
