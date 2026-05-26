import { test, expect } from "@playwright/test";
import { signInAdmin } from "#fixtures/user-info.json";

const name = "Guest"; // At least 5 characters long
const email = "abc@xyz.com";

test("Answer callout as guest", async ({ page }) => {
  await test.step("Answer callout", async () => {
    await page.goto("/crowdnewsroom/test-cnr-anonymous");

    await page.getByRole("button", { name: /Get started/i }).click();

    await page.locator('input[name="data[yourName]"]').fill(name.slice(0, 4));
    await page.locator('input[name="data[email]"]').fill(email);
    await page.getByRole("checkbox", { name: /playwright/i }).check();

    // Button should not be enabled. Name needs to be 5+ characters
    await expect(
      page.getByRole("button", { name: /submit/i }),
      "Submit button should not be enabled",
    ).toBeDisabled();

    await page.locator('input[name="data[yourName]"]').fill(name);
    await page.locator('input[name="data[email]"]').fill(email);

    // Submit becomes enabled
    await expect(
      page.getByRole("button", { name: /submit/i }),
      "Submit button enabled",
    ).toBeEnabled();

    await page.getByRole("button", { name: /submit/i }).click();

    await page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.request().url().includes("/responses") &&
        response.status() === 200,
    );
  });

  await test.step("Verify callout response", async () => {
    await page.goto("/admin/crowdnewsroom");

    await page.locator('input[name="email"]').fill(signInAdmin.email);
    await page.locator('input[name="password"]').fill(signInAdmin.password);
    await page.getByRole("button", { name: /login/i }).click();

    await page.waitForURL(/\/crowdnewsroom/);

    await page
      .locator('a[href="/admin/crowdnewsroom/view/test-cnr-anonymous"]')
      .click();

    await page.getByRole("button", { name: /see all/i }).click();

    // First row of the responses table is the latest response
    const firstResponseRow = await page.locator("tbody tr:first-child");
    await expect(firstResponseRow).toBeVisible();

    await firstResponseRow.getByRole("link").click();

    // Wait for response page to be loaded
    await expect(
      page.locator("h2", { hasText: /response\s+\d+/i }),
    ).toBeVisible();

    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.getByText(email, { exact: true })).toBeVisible();
  });
});
