import { test, expect } from "@playwright/test";
import { signInAdmin, signIn } from "#fixtures/testData.json";

const name = "member";

test("Answer callout as member", async ({ page }) => {
  await test.step("Login and answer callout", async () => {
    await page.goto("/auth/login");
    await page.locator('input[name="email"]').fill(signIn.email);
    await page.locator('input[name="password"]').fill(signIn.password);

    await expect(
      page.getByRole("button", { name: /login/i }),
      "Login button enabled",
    ).toBeEnabled();
    await page.getByRole("button", { name: /login/i }).click();

    await page.waitForURL(/\/profile/);
    console.log("Login successful");

    // Should see callout on homepage
    const calloutLink = await page.getByRole("heading", {
      level: 3,
      name: "Anonymous callout",
    });

    await expect(
      calloutLink,
      "Anonymous callout visible on homepage",
    ).toBeVisible();

    await calloutLink.click();
    await page.waitForURL(/\/test-cnr-anonymous/);

    // Answer callout
    await page.getByRole("button", { name: /Get started/i }).click();

    await page
      .locator('input[name="data[name]"]')
      .pressSequentially(name.slice(0, 4), { delay: 100 });

    await page.getByRole("checkbox", { name: /vitest/i }).check();

    // Button should not be enabled. Name needs to be 5+ characters
    await expect(
      page.getByRole("button", { name: /submit/i }),
      "Submit button should not be enabled",
    ).toBeDisabled();

    await page.locator('input[name="data[name]"]').fill(name);
    await page.locator('input[name="data[email]"]').fill(signIn.email);

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

    await page
      .locator("a")
      .filter({ hasText: /log out/i })
      .click();
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

    const firstResponseRow = await page.locator("tbody tr:first-child");
    await expect(firstResponseRow).toBeVisible();

    await firstResponseRow.getByRole("link").click();

    // Wait for response page to be loaded
    await expect(
      page.locator("h2", { hasText: /response\s+\d+/i }),
    ).toBeVisible();

    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.getByText(signIn.email, { exact: true })).toBeVisible();
    await expect(page.getByText("Vitest", { exact: true })).toBeVisible();
  });
});
