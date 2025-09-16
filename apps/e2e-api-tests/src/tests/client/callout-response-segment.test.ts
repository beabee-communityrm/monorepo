import { BeabeeClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import { beforeAll, describe, expect, it } from 'vitest';

import { CreateCalloutResponseSegmentData } from '../../../../../packages/common/src/types';
import {
  createMinimalTestCalloutResponseAnswers,
  createTestCallout,
  createTestCalloutResponseAnswers,
} from '../../fixtures/callouts';

describe('CalloutResponseSegment API', () => {
  let client: BeabeeClient;
  let userClient: BeabeeClient;
  let testCalloutSlug: string;
  let testResponseId: string;

  beforeAll(async () => {
    // Create authenticated client
    client = new BeabeeClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });

    // Create test callout
    const newCallout = createTestCallout();
    const callout = await client.callout.create(newCallout);
    testCalloutSlug = callout.slug;

    // Create test responses
    const response = await client.callout.createResponse(testCalloutSlug, {
      answers: createTestCalloutResponseAnswers('slide1'),
      guest: {
        email: 'test1@example.com',
        firstname: 'Test',
        lastname: 'Guest 1',
      },
    });
    testResponseId = response.id;

    await client.callout.createResponse(testCalloutSlug, {
      answers: createMinimalTestCalloutResponseAnswers('slide1'),
      guest: {
        email: 'test2@example.com',
        firstname: 'Test',
        lastname: 'Guest 2',
      },
    });
  });

  let testSegmentId: string;

  describe('create', () => {
    it('should create a callout response segment', async () => {
      const newSegment: CreateCalloutResponseSegmentData = {
        name: 'Test Segment',
        ruleGroup: {
          condition: 'AND',
          rules: [
            {
              field: 'id',
              operator: 'equal',
              value: [testResponseId],
            },
          ],
        },
        calloutId: testCalloutSlug,
      };

      const createdSegment = await client.callout.segments.create(
        testCalloutSlug,
        newSegment
      );
      testSegmentId = createdSegment.id;
      const items = await client.callout.segments.list(testCalloutSlug);
      expect(items.find((item) => item.id === createdSegment.id)).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a callout response segment', async () => {
      await client.callout.segments.delete(testCalloutSlug, testSegmentId);
      const items = await client.callout.segments.list(testCalloutSlug);
      expect(items.find((item) => item.id === testSegmentId)).toBeUndefined();
    });
  });
});
