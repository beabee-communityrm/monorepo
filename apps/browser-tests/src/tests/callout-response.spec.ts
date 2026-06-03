import { test, expect } from "@playwright/test";
import { rateLimitedTestUser as member } from "@beabee/test-utils/test-data";
import { nonAdminAuthFile, adminAuthFile } from "../setup/auth-states";

test.use({ storageState: nonAdminAuthFile });

const memberName = "member"; // at least 5 characters long
const guestName = "guest"; // at least 5 characters long
const guestEmail = "foo@bar.xyz";

test("Answer callout", async ({ browser, page }) => {
  await test.step("Answer as member", async () => {
    const memberContext = await browser.newContext({
      storageState: nonAdminAuthFile,
    });
    const memberPage = await memberContext.newPage();

    await memberPage.goto("/profile");

    const calloutTile = await memberPage.getByRole("heading", {
      level: 3,
      name: "Anonymous callout",
    });

    await expect(
      calloutTile,
      "Anonymous callout visible on homepage",
    ).toBeVisible();

    await calloutTile.click();
    await memberPage.waitForURL(/\/test-cnr-anonymous/);

    await memberPage.getByRole("button", { name: /Get started/i }).click();

    const nameField = memberPage.locator('input[name="data[name]"]');
    await nameField.pressSequentially(memberName.slice(0, 2), { delay: 100 }); // Fill name field to show checkbox

    await memberPage.locator('input[name="data[email]"]').fill(member.email);
    await memberPage.getByRole("checkbox", { name: /vitest/i }).check();

    await nameField.fill(memberName); // Displaying checkbox re-renders parts of the form. Fill name field properly here

    const submitBtn = memberPage.getByRole("button", { name: /submit/i });
    await expect(submitBtn, "Submit button enabled").toBeEnabled();
    await submitBtn.click();

    await memberPage.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.request().url().includes("/responses") &&
        response.status() === 200,
    );

    await memberPage.close();
  });

  await test.step("Answer as guest", async () => {
    await page.goto("/crowdnewsroom/test-cnr-anonymous");
    await page.getByRole("button", { name: /Get started/i }).click();

    const nameField = page.locator('input[name="data[name]"]');

    await nameField.pressSequentially(guestName.slice(0, 4), { delay: 100 });
    await page.getByRole("checkbox", { name: /playwright/i }).check();

    // Button should not be enabled. Name needs to be 5+ characters
    await expect(
      page.getByRole("button", { name: /submit/i }),
      "Submit button not enabled",
    ).toBeDisabled();

    await nameField.fill(guestName);
    await page.locator('input[name="data[email]"]').fill(guestEmail);

    // Submit becomes enabled
    const submitBtn = page.getByRole("button", { name: /submit/i });
    await expect(submitBtn, "Submit button enabled").toBeEnabled();
    await submitBtn.click();

    await page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.request().url().includes("/responses") &&
        response.status() === 200,
    );
  });

  await test.step("Verify responses", async () => {
    const adminContext = await browser.newContext({
      storageState: adminAuthFile,
    });
    const adminPage = await adminContext.newPage();

    await adminPage.goto("/admin/crowdnewsroom");

    await adminPage
      .locator('a[href="/admin/crowdnewsroom/view/test-cnr-anonymous"]')
      .click();

    await adminPage.getByRole("button", { name: /see all/i }).click();

    const guestResponse = await adminPage.locator("tbody tr").nth(0);
    const memberResponse = await adminPage.locator("tbody tr").nth(1);

    // Check member response
    await memberResponse.getByRole("link").click();

    // Wait for response page to be loaded
    await expect(
      adminPage.locator("h2", { hasText: /response\s+\d+/i }),
    ).toBeVisible();

    await expect(
      adminPage.getByText(memberName, { exact: true }),
    ).toBeVisible();
    await expect(
      adminPage.getByText(member.email, { exact: true }),
    ).toBeVisible();
    await expect(adminPage.getByText(/vitest/i)).toBeVisible();

    await adminPage.goBack();

    // Check guest response
    await guestResponse.getByRole("link").click();

    await expect(
      adminPage.locator("h2", { hasText: /response\s+\d+/i }),
    ).toBeVisible();

    await expect(adminPage.getByText(guestName, { exact: true })).toBeVisible();
    await expect(
      adminPage.getByText(guestEmail, { exact: true }),
    ).toBeVisible();
    await expect(adminPage.getByText(/playwright/i)).toBeVisible();
  });
});
