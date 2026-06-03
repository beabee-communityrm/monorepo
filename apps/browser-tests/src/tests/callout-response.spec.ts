import { test, expect } from "@playwright/test";
import {
  rateLimitedTestUser as member,
  testUser as admin,
} from "../../../../test-utils/fixtures/test-data.json";

const memberName = "member"; // at least 5 characters long
const guestName = "guest"; // at least 5 characters long
const guestEmail = "foo@bar.xyz";

test("Answer callout", async ({ page }) => {
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

  await test.step("Answer as member", async () => {
    await page.goto("/auth/login");
    await page.locator('input[name="email"]').fill(member.email);
    await page.locator('input[name="password"]').fill(member.password);

    const loginBtn = page.getByRole("button", { name: /login/i });
    await expect(loginBtn, "Login button enabled").toBeEnabled();
    await loginBtn.click();
    await page.waitForURL(/\/profile/);

    const calloutTile = await page.getByRole("heading", {
      level: 3,
      name: "Anonymous callout",
    });

    await expect(
      calloutTile,
      "Anonymous callout visible on homepage",
    ).toBeVisible();

    await calloutTile.click();
    await page.waitForURL(/\/test-cnr-anonymous/);

    await page.getByRole("button", { name: /Get started/i }).click();

    const nameField = page.locator('input[name="data[name]"]');
    await nameField.pressSequentially(memberName.slice(0, 2), { delay: 100 }); // Fill name field to show checkbox

    await page.locator('input[name="data[email]"]').fill(member.email);
    await page.getByRole("checkbox", { name: /vitest/i }).check();

    await nameField.fill(memberName); // Displaying checkbox re-renders parts of the form. Fill name field properly here

    const submitBtn = page.getByRole("button", { name: /submit/i });
    await expect(submitBtn, "Submit button enabled").toBeEnabled();
    await submitBtn.click();

    await page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.request().url().includes("/responses") &&
        response.status() === 200,
    );

    await page
      .locator("a")
      .filter({ hasText: /log out/i })
      .click();
  });

  await test.step("Verify responses", async () => {
    await page.goto("/admin/crowdnewsroom");

    await page.locator('input[name="email"]').fill(admin.email);
    await page.locator('input[name="password"]').fill(admin.password);
    await page.getByRole("button", { name: /login/i }).click();

    await page.waitForURL(/\/crowdnewsroom/);

    await page
      .locator('a[href="/admin/crowdnewsroom/view/test-cnr-anonymous"]')
      .click();

    await page.getByRole("button", { name: /see all/i }).click();

    const memberResponse = await page.locator("tbody tr").nth(0);
    const guestResponse = await page.locator("tbody tr").nth(1);

    // Check member response
    await memberResponse.getByRole("link").click();

    // Wait for response page to be loaded
    await expect(
      page.locator("h2", { hasText: /response\s+\d+/i }),
    ).toBeVisible();

    await expect(page.getByText(memberName, { exact: true })).toBeVisible();
    await expect(page.getByText(member.email, { exact: true })).toBeVisible();
    await expect(page.getByText(/vitest/i)).toBeVisible();

    await page.goBack();

    // Check guest response
    await guestResponse.getByRole("link").click();

    await expect(
      page.locator("h2", { hasText: /response\s+\d+/i }),
    ).toBeVisible();

    await expect(page.getByText(guestName, { exact: true })).toBeVisible();
    await expect(page.getByText(guestEmail, { exact: true })).toBeVisible();
    await expect(page.getByText(/playwright/i)).toBeVisible();
  });
});
