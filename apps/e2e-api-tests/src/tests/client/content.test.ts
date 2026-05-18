import { ContentId, ContentJoinData } from '@beabee/beabee-common';
import { ApiError, ContentClient } from '@beabee/client';
import {
  api,
  testUser,
} from '@beabee/e2e-api-tests/src/fixtures/api-test-info.json';

import { beforeAll, describe, expect, it } from 'vitest';

describe('Content API', () => {
  let contentClient: ContentClient;

  beforeAll(() => {
    contentClient = new ContentClient({
      host: api.host,
      path: api.path,
      token: testUser.apiKey,
    });
  });

  it('should return 400 for non-existing content id with client', async () => {
    try {
      await contentClient.get('non-existing-id' as ContentId);
    } catch (error) {
      if (error instanceof ApiError) {
        expect(error.httpCode).toBe(400);
      }
    }
  });

  it('should fetch content by profile id', async () => {
    const contentId: ContentId = 'profile';
    const content = await contentClient.get(contentId);

    expect(content).toBeDefined();
    expect(content.introMessage).toBeDefined();
  });

  it('should update content', async () => {
    const contentId: ContentId = 'join';
    const updateData: Partial<ContentJoinData> = {
      title: 'Updated join title',
    };

    const updatedContent = await contentClient.update(contentId, updateData);

    expect(updatedContent).toBeDefined();
    expect(updatedContent.title).toBe(updateData.title);
  });
});
