import type { Page } from "@playwright/test";
import { api, testUser as admin } from "@beabee/test-utils/test-data";
import { test, expect, waitForForm } from "../utils/fixtures";
import { answer, answerRow } from "../utils/callout-response";

/** The members-only notice, holding the given action */
const membersOnlyGate = (page: Page, action: string) =>
  page
    .locator("div")
    .filter({ has: page.getByRole("heading", { name: "Members only" }) })
    .filter({ has: page.getByRole("link", { name: action }) })
    .last();

test(
  "Closed CrowdNewsroom can't be answered",
  { tag: "@experimental" },
  async ({ page, createCallout, createContact }) => {
    const slug = await createCallout({
      access: "anonymous",
      responseMode: "multiple",
      expires: new Date(Date.now() - 60_000),
    });
    await createContact();

    await test.step("Details page shows it has ended", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(page.getByText("Ended", { exact: true })).toBeVisible();
      await expect(page.getByText(/^Closed /)).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Get started" }),
      ).toBeHidden();
    });

    await test.step("Respond page shows the closed notice instead of the form", async () => {
      await page.goto(`/crowdnewsroom/${slug}/respond`);
      await expect(
        page.getByText("responses can no longer be added or edited"),
      ).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: "Question" }),
      ).toBeHidden();
    });
  },
);

test(
  "Logged-out visitor is asked to log in",
  { tag: "@experimental" },
  async ({ page, createCallout }) => {
    const slug = await createCallout({
      access: "member",
      responseMode: "multiple",
    });

    for (const path of ["", "/respond"]) {
      await test.step(`Login prompt on ${path || "the details page"}`, async () => {
        await page.goto(`/crowdnewsroom/${slug}${path}`);
        const gate = membersOnlyGate(page, "Log in");
        await expect(gate).toBeVisible();
        await expect(
          gate.getByRole("link", { name: "Join now" }),
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: "Get started" }),
        ).toBeHidden();
        await expect(
          page.getByRole("textbox", { name: "Question" }),
        ).toBeHidden();
      });
    }
  },
);
