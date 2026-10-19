import type { APIRequestContext, Page } from "@playwright/test";
import { api, testUser as admin } from "@beabee/test-utils/test-data";
import { test, expect, waitForForm } from "../utils/fixtures";

async function answer(page: Page, text: string) {
  await waitForForm(page);
  await page.getByRole("textbox", { name: "Question" }).fill(text);
  // The answer is only committed on blur
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "Submit" }).click();
}

async function getResponses(request: APIRequestContext, slug: string) {
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

const answerRow = (page: Page) =>
  page
    .locator("dl > div")
    .filter({
      has: page.getByRole("term").getByText("Question", { exact: true }),
    })
    .getByRole("definition");

test(
  "Member answers, then adds another",
  { tag: "@experimental" },
  async ({ page, request, createCallout, createContact }) => {
    const slug = await createCallout({
      access: "anonymous",
      responseMode: "multiple",
    });
    const contact = await createContact();

    const getStarted = page.getByRole("link", { name: "Get started" });
    const addAnother = page.getByRole("link", {
      name: "Add another response",
    });

    await test.step("Details page offers Get started", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(getStarted).toBeVisible();
    });

    await test.step("Answer and submit", async () => {
      await getStarted.click();
      await answer(page, "First answer");
      await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);
      await expect(answerRow(page)).toHaveText("First answer");
    });

    await test.step("Details page shows the response", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(answerRow(page)).toHaveText("First answer");
      await expect(addAnother).toBeVisible();
      await expect(getStarted).toBeHidden();
    });

    await test.step("Add another opens an empty form", async () => {
      await addAnother.click();
      await waitForForm(page);
      await expect(page.getByRole("textbox", { name: "Question" })).toBeEmpty();
      await answer(page, "Second answer");
      await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);
    });

    await test.step("Details page pages through both, newest first", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(
        page.getByRole("heading", { name: "Your responses (2)" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Response 2 of 2" }),
      ).toBeVisible();
      await expect(answerRow(page)).toHaveText("Second answer");

      await page.getByRole("button", { name: "Previous response" }).click();
      await expect(
        page.getByRole("heading", { name: "Response 1 of 2" }),
      ).toBeVisible();
      await expect(answerRow(page)).toHaveText("First answer");
    });

    await test.step("API has both responses from the member", async () => {
      const responses = await getResponses(request, slug);
      expect(responses).toHaveLength(2);
      expect(responses.map((r: { answers: unknown }) => r.answers)).toEqual([
        { slide1: { question: "First answer" } },
        { slide1: { question: "Second answer" } },
      ]);
      for (const response of responses) {
        expect(response.contact?.id).toBe(contact.id);
      }
    });
  },
);
