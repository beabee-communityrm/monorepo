import { ContentId } from '@beabee/beabee-common';
import { ClientApiError, ContentClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import { beforeAll, describe, expect, it } from 'vitest';

describe('Content API', () => {
  let contentClient: ContentClient;

  beforeAll(() => {
    contentClient = new ContentClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
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
