import {
  type CreateCalloutResponseCommentData,
  GetCalloutResponseWith,
  type GetCalloutsQuery,
  ItemStatus,
} from '@beabee/beabee-common';
import { BeabeeClient } from '@beabee/client';
import {
  API_KEY,
  HOST,
  PATH,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
} from '@beabee/test-utils/vitest/env';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

<<<<<<< HEAD
import { createTestCallout } from '../../fixtures/callouts';
import {
  createMinimalTestCalloutResponseAnswers,
  createTestCalloutResponseAnswers,
} from '../../fixtures/callouts';
=======
import { createTestCallout } from './fixtures/callouts';
import {
  createMinimalTestCalloutResponseAnswers,
  createTestCalloutResponseAnswers,
} from './fixtures/callouts';
>>>>>>> d9dce52b2 (refactor: rename data folder to fixtures)

describe('Callout API', () => {
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

    // Create user client (requires login)
    userClient = new BeabeeClient({
      host: HOST,
      path: PATH,
    });

    // Login for comment operations
    await userClient.auth.login({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
  });

  afterAll(async () => {
    await client.auth.logout();
  });

  describe('Callouts', () => {
    describe('list', () => {
      it('should list callouts with pagination and filtering', async () => {
        const query: GetCalloutsQuery = {
          limit: 100,
          offset: 0,
          sort: 'starts',
          order: 'DESC',
          rules: {
            condition: 'AND',
            rules: [
              {
                field: 'status',
                operator: 'equal',
                value: [ItemStatus.Open],
              },
              {
                field: 'hidden',
                operator: 'equal',
                value: [false],
              },
            ],
          },
        };

        const response = await client.callout.list(query);

        expect(response).toBeDefined();
        expect(response).toHaveProperty('total');
        expect(response).toHaveProperty('items');
        expect(Array.isArray(response.items)).toBe(true);

        if (response.items.length > 0) {
          const firstCallout = response.items[0];
          expect(firstCallout).toHaveProperty('id');
          expect(firstCallout).toHaveProperty('slug');
          expect(firstCallout).toHaveProperty('title');
        }
      });
    });

    describe('get', () => {
      it('should get a callout by slug with form data', async () => {
        const response = await client.callout.get(testCalloutSlug, [
          'form',
        ] as const);

        expect(response).toBeDefined();
        expect(response.slug).toBe(testCalloutSlug);
        expect(response).toHaveProperty('formSchema');
      });
    });
  });

  describe('Callout Responses', () => {
    describe('list', () => {
      it('should list responses with pagination and filtering', async () => {
        const { items } = await client.callout.listResponses(
          testCalloutSlug,
          {},
          [GetCalloutResponseWith.Answers]
        );

        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);

        const firstResponse = items[0];
        expect(firstResponse).toHaveProperty('id');
        expect(firstResponse).toHaveProperty('createdAt');
        expect(firstResponse.createdAt).toBeInstanceOf(Date);
        expect(firstResponse).toHaveProperty('answers');
      });
    });

    describe('get', () => {
      it('should get a response with specified relations', async () => {
        const response = await client.callout.response.get(testResponseId, [
          GetCalloutResponseWith.Callout,
          GetCalloutResponseWith.Contact,
          GetCalloutResponseWith.Assignee,
          GetCalloutResponseWith.LatestComment,
        ] as const);

        expect(response).toBeDefined();
        expect(response.id).toBe(testResponseId);
        expect(response.createdAt).toBeInstanceOf(Date);
        expect(response.updatedAt).toBeInstanceOf(Date);
        expect(response.contact?.email).toBe('test1@example.com');
        expect(response.contact?.firstname).toBe('Test');
        expect(response.contact?.lastname).toBe('Guest 1');
        expect(response.callout).toBeDefined();
      });
    });

    describe('update', () => {
      it('should update a response', async () => {
        const updateData = {
          bucket: 'updated-bucket',
        };

        const response = await client.callout.response.update(
          testResponseId,
          updateData
        );

        expect(response).toBeDefined();
        expect(response.id).toBe(testResponseId);
        expect(response.bucket).toBe(updateData.bucket);
      });
    });
  });

  describe('Callout Response Comments', () => {
    let testCommentId: string;

    describe('create', () => {
      it('should create a new comment', async () => {
        const newComment: CreateCalloutResponseCommentData = {
          text: 'Test comment',
          responseId: testResponseId,
        };

        // Create comment with user logged in client
        const response =
          await userClient.callout.response.comment.create(newComment);
        testCommentId = response.id;

        expect(response).toBeDefined();
        expect(response.text).toBe(newComment.text);
        expect(response.createdAt).toBeInstanceOf(Date);
        expect(response.contact).toBeDefined();
      });
    });

    describe('update', () => {
      it('should update an existing comment', async () => {
        const updateData = {
          text: 'Updated comment',
        };

        const response = await client.callout.response.comment.update(
          testCommentId,
          updateData
        );

        expect(response).toBeDefined();
        expect(response.text).toBe(updateData.text);
        expect(response.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('list', () => {
      it('should list comments for a response', async () => {
        const response = await client.callout.response.comment.list({
          rules: {
            rules: [
              {
                field: 'responseId',
                operator: 'equal',
                value: [testResponseId],
              },
            ],
            condition: 'AND',
          },
        });

        expect(response.items.length).toBeGreaterThan(0);
        expect(response.items[0]).toHaveProperty('text');
        expect(response.items[0]).toHaveProperty('contact');
      });
    });

    describe('delete', () => {
      it('should delete a comment', async () => {
        await client.callout.response.comment.delete(testCommentId);

        const { items } = await client.callout.response.comment.list({
          rules: {
            rules: [{ field: 'id', operator: 'equal', value: [testCommentId] }],
            condition: 'AND',
          },
        });
        expect(items.length).toBe(0);
      });
    });
  });
});
