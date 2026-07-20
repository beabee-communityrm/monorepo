import { MAX_FILE_SIZE_IN_BYTES } from '@beabee/beabee-common';
import {
  BadRequestError,
  BeabeeClient,
  FileTooLargeError,
  UnsupportedFileTypeError,
} from '@beabee/client';
import { api, testUser } from '@beabee/test-utils/test-data';

import * as fs from 'fs';
import { resolve } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createTestFile } from '#utils/file.ts';

import { FIXTURE_PATH } from '../../env';

describe('Upload API', () => {
  let client: BeabeeClient;

  beforeEach(async () => {
    client = new BeabeeClient({
      host: api.host,
      path: api.path,
      token: testUser.apiKey,
    });

    // Log in the user to not hit rate limits
    await client.auth.login({
      email: testUser.email,
      password: testUser.password,
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
        expect(error).toBeInstanceOf(UnsupportedFileTypeError);
      }
    });
  });

  describe('Invalid file uploads', () => {
    // These files are constructed in memory rather than committed as fixtures,
    // both to avoid an oversized fixture in the repo and because content only
    // needs to be "real" enough to trigger the specific validation path.

    it('should reject an empty file', async () => {
      const emptyFile = new File([], 'empty.png', { type: 'image/png' });

      await expect(client.upload.uploadFile(emptyFile)).rejects.toBeInstanceOf(
        BadRequestError
      );
    });

    it('should reject random bytes with an image extension', async () => {
      const randomBytes = new Uint8Array(2048).map((_, i) => i % 256);
      const randomFile = new File([randomBytes], 'random-bytes.jpg', {
        type: 'image/jpeg',
      });

      await expect(client.upload.uploadFile(randomFile)).rejects.toBeInstanceOf(
        BadRequestError
      );
    });

    it('should reject plain text content with an image extension', async () => {
      const textFile = new File(
        ['This is definitely not an image, just plain text.'],
        'not-an-image.gif',
        { type: 'image/gif' }
      );

      await expect(client.upload.uploadFile(textFile)).rejects.toBeInstanceOf(
        BadRequestError
      );
    });

    it('should reject a truncated image', async () => {
      // Cut off a real PNG partway through, valid header but incomplete body
      const pngPath = resolve(FIXTURE_PATH, '600x400.png');
      const fullBuffer = fs.readFileSync(pngPath);
      const truncatedBuffer = fullBuffer.subarray(
        0,
        Math.floor(fullBuffer.length * 0.4)
      );
      const truncatedFile = new File([truncatedBuffer], 'truncated.png', {
        type: 'image/png',
      });

      await expect(
        client.upload.uploadFile(truncatedFile)
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it('should reject SVG content uploaded with a non-SVG extension', async () => {
      const svgContent =
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
      const mislabeledFile = new File([svgContent], 'svg-content.png', {
        type: 'image/png',
      });

      await expect(
        client.upload.uploadFile(mislabeledFile)
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it('should reject an unsupported image format', async () => {
      const bmpFile = new File([new Uint8Array(16)], 'unsupported-format.bmp', {
        type: 'image/bmp',
      });

      await expect(client.upload.uploadFile(bmpFile)).rejects.toBeInstanceOf(
        UnsupportedFileTypeError
      );
    });

    it('should reject a file over the size limit', async () => {
      const oversizedFile = new File(
        [new Uint8Array(MAX_FILE_SIZE_IN_BYTES + 1)],
        'oversized.png',
        { type: 'image/png' }
      );

      await expect(
        client.upload.uploadFile(oversizedFile)
      ).rejects.toBeInstanceOf(FileTooLargeError);
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
