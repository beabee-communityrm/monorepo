import { GetCalloutResponseCommentData, Serial } from '@beabee/beabee-common';
import { CalloutResponseCommentClient } from '@beabee/client';

import { describe, expect, it } from 'vitest';

describe('CalloutResponseComment API', () => {
  describe('deserialize', () => {
    it('should correctly deserialize comment data', () => {
      const now = new Date();
      const serializedData: Serial<GetCalloutResponseCommentData> = {
        id: 'test-id',
        responseId: 'test-response-id',
        text: 'Test comment',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        contact: {
          id: 'contact-id',
          email: 'test@example.com',
          firstname: 'Test',
          lastname: 'User',
          joined: now,
          activeRoles: [],
          displayName: 'Test User',
        },
      };

      const result = CalloutResponseCommentClient.deserialize(serializedData);

      expect(result.id).toBe(serializedData.id);
      expect(result.text).toBe(serializedData.text);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe(serializedData.createdAt);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.toISOString()).toBe(serializedData.updatedAt);
      expect(result.contact).toBeDefined();
      expect(result.contact.id).toBe(serializedData.contact.id);
    });
  });
});
