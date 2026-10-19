import type { APIRequestContext, Page } from "@playwright/test";
import { api, testUser as admin } from "@beabee/test-utils/test-data";
import { expect, waitForForm } from "./fixtures";

export async function answer(page: Page, text: string) {
  await waitForForm(page);
  await page.getByRole("textbox", { name: "Question" }).fill(text);
  // The answer is only committed on blur
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "Submit" }).click();
}

export async function getResponses(request: APIRequestContext, slug: string) {
  const response = await request.get(
    `${api.host}${api.path}/callout/${slug}/responses`,
    {
      headers: { Authorization: `Bearer ${admin.apiKey}` },
      params: new URLSearchParams([
        ["with", "answers"],
        ["with", "contact"],
        ["sort", "createdAt"],
        ["order", "ASC"],
      ]),
    },
  );
  expect(response.ok(), "Responses fetched").toBeTruthy();
  return (await response.json()).items;
}

export const answerRow = (page: Page) =>
  page
    .locator("dl > div")
    .filter({
      has: page.getByRole("term").getByText("Question", { exact: true }),
    })
    .getByRole("definition");
