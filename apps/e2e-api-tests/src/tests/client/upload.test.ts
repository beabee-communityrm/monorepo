import { BeabeeClient, ClientApiError } from '@beabee/client';
import { createTestFile } from '@beabee/test-utils/node';
import {
  API_KEY,
  HOST,
  PATH,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
} from '@beabee/test-utils/vitest/env';

import { resolve } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FIXTURE_PATH } from '../../env';

describe('Upload API', () => {
  let client: BeabeeClient;

  beforeEach(async () => {
    client = new BeabeeClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });

    // Log in the user to not hit rate limits
    await client.auth.login({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
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

  describe('uploadFile', () => {
    it('should upload a PDF document', async () => {
      const pdfPath = resolve(FIXTURE_PATH, 'Lorem-Ipsum.pdf');
      const pdfFile = createTestFile(pdfPath, 'application/pdf');

      const response = await client.upload.uploadFile(pdfFile);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.url).toBeDefined();
      expect(response.url).toContain('/documents/');
      expect(response.path).toBeDefined();
      expect(response.hash).toBeDefined();
      expect(response.filename).toBe('Lorem-Ipsum.pdf');
    });

    it('should upload a PNG image', async () => {
      const pngPath = resolve(FIXTURE_PATH, '600x400.png');
      const pngFile = createTestFile(pngPath, 'image/png');

      const response = await client.upload.uploadFile(pngFile);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.url).toBeDefined();
      expect(response.url).toContain('/images/');
      expect(response.path).toBeDefined();
      expect(response.hash).toBeDefined();
      expect(response.filename).toBe('600x400.png');
    });

    it('should upload an SVG image', async () => {
      const svgPath = resolve(FIXTURE_PATH, '400x600.svg');
      const svgFile = createTestFile(svgPath, 'image/svg+xml');

      const response = await client.upload.uploadFile(svgFile);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.url).toBeDefined();
      expect(response.url).toContain('/images/');
      expect(response.path).toBeDefined();
      expect(response.hash).toBeDefined();
      expect(response.filename).toBe('400x600.svg');
    });

    it('should throw an error for unsupported file types', async () => {
      // Create a text file which should be unsupported
      const textFile = new File(['This is a test'], 'test.txt', {
        type: 'text/plain',
      });

      try {
        await client.upload.uploadFile(textFile);
        // If we reach this point, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ClientApiError);
        if (error instanceof ClientApiError) {
          expect(error.httpCode).toBe(415);
          expect(error.code).toBe('UNSUPPORTED_FILE_TYPE');
        }
      }
    });
  });

  describe('Specialized upload clients', () => {
    it('should use image client for image uploads', async () => {
      const svgPath = resolve(FIXTURE_PATH, '400x600.svg');
      const svgFile = createTestFile(svgPath, 'image/svg+xml');

      const response = await client.upload.image.uploadFile(svgFile);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.url).toBeDefined();
      expect(response.url).toContain('/images/');
      expect(response.path).toBeDefined();
      expect(response.hash).toBeDefined();
      expect(response.filename).toBe('400x600.svg');
    });

    it('should use document client for document uploads', async () => {
      const pdfPath = resolve(FIXTURE_PATH, 'Lorem-Ipsum.pdf');
      const pdfFile = createTestFile(pdfPath, 'application/pdf');

      const response = await client.upload.document.uploadFile(pdfFile);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.url).toBeDefined();
      expect(response.url).toContain('/documents/');
      expect(response.path).toBeDefined();
      expect(response.hash).toBeDefined();
      expect(response.filename).toBe('Lorem-Ipsum.pdf');
    });
  });
});
