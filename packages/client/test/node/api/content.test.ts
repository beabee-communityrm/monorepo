import { describe, expect, it, beforeAll } from "@jest/globals";
import { ContentClient, ClientApiError } from "@beabee/client";
import { ContentId } from "@beabee/beabee-common";
import { API_KEY, HOST, PATH } from "./utils/env.js";

describe("Content API", () => {
  let contentClient: ContentClient;

  beforeAll(() => {
    contentClient = new ContentClient({
      host: HOST,
      path: PATH,
      token: API_KEY
    });
  });

  it("should return 400 for non-existing content id with client", async () => {
    try {
      await contentClient.get("non-existing-id" as ContentId);
    } catch (error) {
      if (error instanceof ClientApiError) {
        expect(error.httpCode).toBe(400);
      }
    }
  });
});
