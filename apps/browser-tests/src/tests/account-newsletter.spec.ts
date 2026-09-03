import { test, expect } from "@playwright/test";
import {
  api,
  rateLimitedTestUser as member,
  testUser as admin,
} from "@beabee/test-utils/test-data";
import { nonAdminAuthFile } from "../setup/auth-states";

test.use({ storageState: nonAdminAuthFile });

// Groups provided by the test newsletter provider
const KOMBUCHA = { id: "b8e4acb751", label: "Kombucha" };
const TEA = { id: "c0b1a133d1", label: "Tea" };

test("Manage newsletter subscriptions", async ({ page, request, baseURL }) => {
  // The account page with the subscriptions tab only exists in the new
  // frontend, which the router serves when this cookie is set
  await page.context().addCookies([
    { name: "beabee_frontend", value: "new", url: baseURL! },
  ]);

  await test.step("Give the member a known set of groups", async () => {
    // A full group update also pushes the groups to the newsletter provider,
    // which is what the unsubscribe below is applied against
    const response = await request.patch(
      `${api.host}${api.path}/contact/${member.contactId}`,
      {
        headers: { Authorization: `Bearer ${admin.apiKey}` },
        data: {
          profile: {
            newsletterStatus: "subscribed",
            newsletterGroups: [KOMBUCHA.id, TEA.id],
          },
        },
      },
    );
    expect(response.ok(), "Profile update succeeded").toBeTruthy();
  });

  const unsubscribeButtons = page.getByRole("button", {
    name: /unsubscribe/i,
  });
  const groupLabel = (label: string) => page.getByText(label, { exact: true });

  await test.step("Groups are listed on the subscriptions tab", async () => {
    await page.goto("/profile/account");
    await page.getByRole("tab", { name: /subscriptions/i }).click();

    await expect(groupLabel(KOMBUCHA.label), "Kombucha listed").toBeVisible();
    await expect(groupLabel(TEA.label), "Tea listed").toBeVisible();
    await expect(unsubscribeButtons, "One button per group").toHaveCount(2);
  });

  await test.step("Unsubscribe from a single group", async () => {
    await groupLabel(TEA.label)
      .locator("..")
      .getByRole("button", { name: /unsubscribe/i })
      .click();

    await expect(
      page.getByRole("alert").getByText(/unsubscribed from tea/i),
      "Success notification visible",
    ).toBeVisible();
    await expect(groupLabel(TEA.label), "Tea removed").not.toBeVisible();
    await expect(groupLabel(KOMBUCHA.label), "Kombucha kept").toBeVisible();
    await expect(unsubscribeButtons).toHaveCount(1);
  });

  await test.step("Change persists after reload", async () => {
    await page.reload();
    await page.getByRole("tab", { name: /subscriptions/i }).click();

    await expect(groupLabel(KOMBUCHA.label), "Kombucha kept").toBeVisible();
    await expect(groupLabel(TEA.label), "Tea still gone").not.toBeVisible();
  });

  await test.step("Failed unsubscribe keeps the group", async () => {
    await page.route("**/api/1.0/contact/me/newsletter-groups/*", (route) =>
      route.request().method() === "DELETE"
        ? route.abort()
        : route.continue(),
    );

    await unsubscribeButtons.click();

    await expect(
      page.getByRole("alert").getByText(/something went wrong/i),
      "Error notification visible",
    ).toBeVisible();
    await expect(groupLabel(KOMBUCHA.label), "Kombucha kept").toBeVisible();
    await expect(unsubscribeButtons).toHaveCount(1);
  });
});
