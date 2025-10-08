import type { UpdateEmailData } from '@beabee/beabee-common';
import { EmailClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import { beforeAll, describe, expect, it } from 'vitest';

describe('Email API', () => {
  let emailClient: EmailClient;

  beforeAll(() => {
    emailClient = new EmailClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });
  });

  describe('get', () => {
    it('should retrieve email data by ID', async () => {
      try {
        // Test with welcome email template
        const response = await emailClient.get('welcome');

        expect(response).toBeDefined();
        if (response) {
          expect(response).toHaveProperty('subject');
          expect(response).toHaveProperty('body');
          expect(typeof response.subject).toBe('string');
          expect(typeof response.body).toBe('string');
        }
      } catch (error: any) {
        // Template might not exist in test environment
        expect(error.httpCode).toBe(404);
        expect(error.name).toBe('NotFoundError');
      }
    });

    it('should throw NotFoundError for non-existent email template', async () => {
      try {
        await emailClient.get('non-existent-template');
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.httpCode).toBe(404);
        expect(error.name).toBe('NotFoundError');
      }
    });

    it('should throw NotFoundError for external template', async () => {
      try {
        await emailClient.get('external-template');
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.httpCode).toBe(404);
        expect(error.name).toBe('NotFoundError');
      }
    });
  });

  describe('update', () => {
    it('should update an existing email template', async () => {
      const templateId = 'welcome';
      const updateData: UpdateEmailData = {
        subject: 'Updated Welcome Email',
        body: 'Welcome to our platform! This is an updated message.',
      };

      const response = await emailClient.update(templateId, updateData);

      expect(response).toBeDefined();
      expect(response.subject).toBe(updateData.subject);
      expect(response.body).toBe(updateData.body);
    });

    it('should handle updating with empty subject and body', async () => {
      const templateId = 'welcome';
      const updateData: UpdateEmailData = {
        subject: '',
        body: '',
      };

      const response = await emailClient.update(templateId, updateData);

      expect(response).toBeDefined();
      expect(response.subject).toBe('');
      expect(response.body).toBe('');
    });

    it('should fail when updating non-existent template', async () => {
      const templateId = 'non-existent-template';
      const updateData: UpdateEmailData = {
        subject: 'Test Subject',
        body: 'Test Body',
      };

      try {
        await emailClient.update(templateId, updateData);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.httpCode).toBe(404);
      }
    });
  });

  describe('error handling', () => {
    it('should handle invalid template ID format', async () => {
      const invalidId = 'invalid/id/format';

      try {
        await emailClient.get(invalidId);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.httpCode).toBe(404);
      }
    });

    it('should handle unauthorized access', async () => {
      // Create client without API key
      const unauthorizedClient = new EmailClient({
        host: HOST,
        path: PATH,
      });

      try {
        await unauthorizedClient.get('welcome');
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.httpCode).toBe(403); // 401 is for unauthorized, 403 is for forbidden
      }
    });
  });
});
