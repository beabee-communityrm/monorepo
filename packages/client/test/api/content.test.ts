import { describe, expect, it, beforeAll } from "vitest";
import { ContentClient, ClientApiError } from "@beabee/client";
import { ContentId, ContentJoinData } from "@beabee/beabee-common";
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

  it("should fetch content by profile id", async () => {
    const contentId: ContentId = "profile";
    const content = await contentClient.get(contentId);

    expect(content).toBeDefined();
    expect(content.introMessage).toBeDefined();
  });

  it("should update content", async () => {
    const contentId: ContentId = "join";
    const updateData: Partial<ContentJoinData> = {
      title: "Updated join title"
    };

    const updatedContent = await contentClient.update(contentId, updateData);

    expect(updatedContent).toBeDefined();
    expect(updatedContent.title).toBe(updateData.title);
  });
});
