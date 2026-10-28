import type { Page } from "@playwright/test";
import { GetCalloutResponseWith } from "@beabee/beabee-common";
import { admin, waitForForm } from "./fixtures";

export async function answer(page: Page, text: string) {
  await waitForForm(page);
  await page.getByRole("textbox", { name: "Question" }).fill(text);
  // The answer is only committed on blur
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "Submit" }).click();
}

export async function getResponses(slug: string) {
  const { items } = await admin.callout.listResponses(
    slug,
    { sort: "createdAt", order: "ASC" },
    [GetCalloutResponseWith.Answers, GetCalloutResponseWith.Contact],
  );
  return items;
}

export const answerRow = (page: Page) =>
  page
    .locator("dl > div")
    .filter({
      has: page.getByRole("term").getByText("Question", { exact: true }),
    })
    .getByRole("definition");
