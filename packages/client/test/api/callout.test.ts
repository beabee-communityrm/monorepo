import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { BeabeeClient } from "@beabee/client";
import { ItemStatus, type GetCalloutsQuery, type CreateCalloutResponseCommentData } from "@beabee/beabee-common";
import { API_KEY, HOST, PATH, TEST_USER_EMAIL, TEST_USER_PASSWORD } from "./utils/env.js";
import { createTestCallout } from "./data/callouts";
import { createTestCalloutResponseAnswers, createMinimalTestCalloutResponseAnswers } from "./data/callouts";

describe("Callout API", () => {
  let client: BeabeeClient;
  let userClient: BeabeeClient;
  let testCalloutSlug: string;
  let testResponseId: string;

  beforeAll(async () => {
    // Create authenticated client
    client = new BeabeeClient({
      host: HOST,
      path: PATH,
      token: API_KEY
    });

    // Create test callout
    const newCallout = createTestCallout();
    const callout = await client.callout.create(newCallout);
    testCalloutSlug = callout.slug;

    // Create test responses
    const response = await client.callout.createResponse(testCalloutSlug, {
      answers: createTestCalloutResponseAnswers("slide1"),
      guestName: "Test Guest 1",
      guestEmail: "test1@example.com"
    });
    testResponseId = response.id;

    await client.callout.createResponse(testCalloutSlug, {
      answers: createMinimalTestCalloutResponseAnswers("slide1"),
      guestName: "Test Guest 2",
      guestEmail: "test2@example.com"
    });

    // Create user client (requires login)
    userClient = new BeabeeClient({
      host: HOST,
      path: PATH,
    });
    
    // Login for comment operations
    await userClient.auth.login({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
  });

  afterAll(async () => {
    await client.auth.logout();
  });

  describe("Callouts", () => {
    describe("list", () => {
      it("should list callouts with pagination and filtering", async () => {
        const query: GetCalloutsQuery = {
          limit: 100,
          offset: 0,
          sort: "starts",
          order: "DESC",
          rules: {
            condition: "AND",
            rules: [
              {
                field: "status",
                operator: "equal",
                value: [ItemStatus.Open]
              },
              // TODO: There seem to be problems with arrays with multiple entries in a query string, see packages/client/src/utils/url.ts
              // {
              //   field: "hidden",
              //   operator: "equal",
              //   value: [false]
              // }
            ]
          }
        };

        const response = await client.callout.list(query);

        expect(response).toBeDefined();
        expect(response).toHaveProperty("total");
        expect(response).toHaveProperty("items");
        expect(Array.isArray(response.items)).toBe(true);

        if (response.items.length > 0) {
          const firstCallout = response.items[0];
          expect(firstCallout).toHaveProperty("id");
          expect(firstCallout).toHaveProperty("slug");
          expect(firstCallout).toHaveProperty("title");
        }
      });
    });

    describe("get", () => {
      it("should get a callout by slug with form data", async () => {
        const response = await client.callout.get(testCalloutSlug, ["form"] as const);

        expect(response).toBeDefined();
        expect(response.slug).toBe(testCalloutSlug);
        expect(response).toHaveProperty("formSchema");
      });
    });
  });

  describe("Callout Responses", () => {
    describe("list", () => {
      it("should list responses with pagination and filtering", async () => {
        const { items } = await client.callout.listResponses(testCalloutSlug, {}, ["answers"] as const);

        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);

        const firstResponse = items[0];
        expect(firstResponse).toHaveProperty("id");
        expect(firstResponse).toHaveProperty("createdAt");
        expect(firstResponse.createdAt).toBeInstanceOf(Date);
        expect(firstResponse).toHaveProperty("answers");
      });
    });

    describe("get", () => {
      it("should get a response with specified relations", async () => {
        const response = await client.callout.response.get(testResponseId, [
          "callout",
          "contact",
          "assignee",
          "latestComment"
        ] as const);

        expect(response).toBeDefined();
        expect(response.id).toBe(testResponseId);
        expect(response.createdAt).toBeInstanceOf(Date);
        expect(response.updatedAt).toBeInstanceOf(Date);
        expect(response.callout).toBeDefined();
      });
    });

    describe("update", () => {
      it("should update a response", async () => {
        const updateData = {
          guestName: "Updated Guest Name"
        };

        const response = await client.callout.response.update(testResponseId, updateData);

        expect(response).toBeDefined();
        expect(response.id).toBe(testResponseId);
        expect(response.guestName).toBe(updateData.guestName);
      });
    });
  });

  describe("Callout Response Comments", () => {
    let testCommentId: string;

    describe("create", () => {
      it("should create a new comment", async () => {
        const newComment: CreateCalloutResponseCommentData = {
          text: "Test comment",
          responseId: testResponseId
        };

        // Create comment with user logged in client
        const response = await userClient.callout.response.comment.create(newComment);
        testCommentId = response.id;

        expect(response).toBeDefined();
        expect(response.text).toBe(newComment.text);
        expect(response.createdAt).toBeInstanceOf(Date);
        expect(response.contact).toBeDefined();
      });
    });

    describe("update", () => {
      it("should update an existing comment", async () => {
        const updateData = {
          text: "Updated comment"
        };

        const response = await client.callout.response.comment.update(testCommentId, updateData);

        expect(response).toBeDefined();
        expect(response.text).toBe(updateData.text);
        expect(response.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe("list", () => {
      it("should list comments for a response", async () => {
        const response = await client.callout.response.comment.list({
          rules: {
            rules: [{ field: "responseId", operator: "equal", value: [testResponseId] }],
            condition: "AND"
          }
        });

        expect(response.items.length).toBeGreaterThan(0);
        expect(response.items[0]).toHaveProperty("text");
        expect(response.items[0]).toHaveProperty("contact");
      });
    });

    describe("delete", () => {
      it("should delete a comment", async () => {
        await client.callout.response.comment.delete(testCommentId);

        const { items } = await client.callout.response.comment.list({
          rules: {
            rules: [{ field: "id", operator: "equal", value: [testCommentId] }],
            condition: "AND"
          }
        });
        expect(items.length).toBe(0);
      });
    });
  });
});
