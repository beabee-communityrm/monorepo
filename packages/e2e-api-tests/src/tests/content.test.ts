import { describe, expect, it, beforeAll } from "@jest/globals";
import { ContentClient, ClientApiError } from '@beabee/client';
import { ContentId } from '@beabee/beabee-common';

import dotenv from 'dotenv';

const HOST = process.env.APP_BASE_URL || 'http://localhost:3002';
const PATH = process.env.APP_BASE_URL || '/api/1.0';
const IS_GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true';

dotenv.config({ path: ['.env', '.env.example'] });

describe('Content API', () => {
  let contentClient: ContentClient;

  beforeAll(() => {
    contentClient = new ContentClient({
      host: HOST,
      path: PATH,
      token: 'test-token',
      appUrl: HOST
    });
  });

  it('should return 400 for non-existing content id with client', async () => {
    try {
      await contentClient.get('non-existing-id' as ContentId);
    } catch (error) {
      if (error instanceof ClientApiError) {
        expect(error.httpCode).toBe(400);
      }
    }
  });
});
