import { test as setup, expect } from "@playwright/test";
import {
  rateLimitedTestUser as member,
  testUser as admin,
} from "@beabee/test-utils/test-data";

import { nonAdminAuthFile, adminAuthFile } from "./auth-states";

setup("authenticate as non-admin user", async ({ page }) => {
  await page.goto("/auth/login");
  await page.locator('input[name="email"]').fill(member.email);
  await page.locator('input[name="password"]').fill(member.password);

  await expect(
    page.getByRole("button", { name: /login/i }),
    "Login button enabled",
  ).toBeEnabled();
  await page.getByRole("button", { name: /login/i }).click();

  await page.waitForURL(/\/profile/);
  await page.context().storageState({ path: nonAdminAuthFile });
});

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/auth/login");
  await page.locator('input[name="email"]').fill(admin.email);
  await page.locator('input[name="password"]').fill(admin.password);

  await expect(
    page.getByRole("button", { name: /login/i }),
    "Login button enabled",
  ).toBeEnabled();
  await page.getByRole("button", { name: /login/i }).click();

  await page.waitForURL(/\/admin/);
  await page.context().storageState({ path: adminAuthFile });
});
