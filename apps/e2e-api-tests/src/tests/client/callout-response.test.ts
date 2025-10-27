import {
  CalloutAccess,
  CalloutCaptcha,
  GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  ItemStatus,
  Serial,
} from '@beabee/beabee-common';
import { CalloutResponseClient } from '@beabee/client';

import { describe, expect, it } from 'vitest';
import { createTestCalloutResponseAnswers } from '../../fixtures/callouts';


describe('CalloutResponse API', () => {
  describe('deserialize', () => {
    it('should correctly deserialize response data with all relations', () => {
      const now = new Date();
      const serializedData: Serial<
        GetCalloutResponseDataWith<
          | GetCalloutResponseWith.Answers
          | GetCalloutResponseWith.Callout
          | GetCalloutResponseWith.Contact
          | GetCalloutResponseWith.Tags
        >
      > = {
        id: 'test-id',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        number: 1,
        bucket: 'default',
        guestName: null,
        guestEmail: null,
        answers: createTestCalloutResponseAnswers('slide1'),
        tags: [],
        callout: {
          id: 'test-callout-id',
          slug: 'test-callout-slug',
          title: 'Test Callout',
          status: ItemStatus.Open,
          image: '',
          starts: null,
          expires: null,
          allowUpdate: true,
          allowMultiple: false,
          access: CalloutAccess.Anonymous,
          hidden: false,
          captcha: CalloutCaptcha.None,
          channels: [],
          excerpt: 'Test Callout Excerpt',
        },
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

      const result = CalloutResponseClient.deserialize<
        | GetCalloutResponseWith.Answers
        | GetCalloutResponseWith.Callout
        | GetCalloutResponseWith.Contact
        | GetCalloutResponseWith.Tags
      >(serializedData);

      expect(result.id).toBe(serializedData.id);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.answers).toEqual(serializedData.answers);
      expect(result.callout).toBeDefined();
      expect(result.contact).toBeDefined();
      expect(result.tags).toEqual(serializedData.tags);
    });
  });
});
