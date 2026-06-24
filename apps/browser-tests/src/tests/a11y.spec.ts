import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { mkdir } from "fs/promises";
import { signInAdmin } from "#fixtures/testData.json";

// ─── Public pages ─────────────────────────────────────────────────────────────

for (const [name, path] of [
  ["Home", "/"],
  ["Join", "/join"],
  ["Login", "/auth/login"],
  ["Forgot Password", "/auth/forgot-password"],
  ["Lost Device", "/auth/lost-device"],
]) {
  test(`${name} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

// ─── Authenticated pages ──────────────────────────────────────────────────────
// beforeAll logs in once and saves auth state; each test restores it so they
// run independently without repeated logins.

const AUTH_STATE = "playwright/.auth.json";

test.describe("authenticated pages", () => {
  test.beforeAll(async ({ browser }) => {
    await mkdir("playwright", { recursive: true });
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto("/admin");
    await page.locator('input[name="email"]').fill(signInAdmin.email);
    await page.locator('input[name="password"]').fill(signInAdmin.password);
    await page.getByRole("button", { name: /login/i }).click();
    await page.locator('input[name="password"]').waitFor({ state: "detached" });

    await context.storageState({ path: AUTH_STATE });
    await context.close();
  });

  test.use({ storageState: AUTH_STATE });

  for (const [name, path] of [
    // Member pages
    ["Profile", "/profile"],
    ["Profile — Account", "/profile/account"],
    ["Profile — Contribution", "/profile/contribution"],
    // Admin pages
    ["Crowdnewsroom", "/crowdnewsroom"],
    ["Admin — Dashboard", "/admin"],
    ["Admin — Contacts", "/admin/contacts"],
    ["Admin — Add Contact", "/admin/contacts/add"],
    ["Admin — Contact Tags", "/admin/contacts/tags"],
    ["Admin — Email Templates", "/admin/contacts/email-templates"],
    ["Admin — New Email Template", "/admin/contacts/email-templates/new"],
    ["Admin — Crowdnewsroom", "/admin/crowdnewsroom"],
    ["Admin — New Crowdnewsroom", "/admin/crowdnewsroom/new"],
    ["Admin — Membership Builder", "/admin/membership-builder"],
    ["Admin — Membership Builder Intro", "/admin/membership-builder/intro"],
    ["Admin — Notices", "/admin/notices"],
    ["Admin — Add Notice", "/admin/notices/add"],
    ["Admin — Payments", "/admin/payments"],
    ["Admin — Settings", "/admin/settings"],
    ["Admin — API Keys", "/admin/settings/api-keys"],
    ["Admin — Emails", "/admin/settings/emails"],
    ["Admin — Theme", "/admin/settings/theme"],
    ["Admin — UI Toolkit", "/admin/ui-toolkit"],
  ]) {
    test(`${name} has no accessibility violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
