import { test, expect } from "@playwright/test";
import { adminAuthFile } from "../setup/auth-states";
import {
  ApiHealthStatus,
  NewsletterIntegrationDataWith,
} from "@beabee/beabee-common";

test.use({ storageState: adminAuthFile });

test("Integration health status and group refresh", async ({ page }) => {
  // Case 1: No provider configured
  let response: NewsletterIntegrationDataWith<"health"> = {
    provider: "none",
    status: ApiHealthStatus.DISABLED,
  };

  // Configure interceptor
  await page.route("/api/1.0/integrations/newsletter?with=health", (route) =>
    route.fulfill({ json: response }),
  );

  // Go to integration setting page
  await page.goto("/admin/settings/integrations");
  await expect(
    page.getByText("Disabled"),
    "Disabled status visible",
  ).toBeVisible();

  // Change provider, status unhealthy
  response = {
    provider: "mailchimp",
    audienceId: "1a2b3c4d",
    groups: [],
    status: ApiHealthStatus.UNHEALTHY,
  };
  await page.reload();
  await expect(
    page.getByText("Connection lost"),
    "Disconnected status visible",
  ).toBeVisible();

  // Provider configured, status healthy
  response = {
    provider: "mailchimp",
    audienceId: "1a2b3c4d",
    groups: [{ id: "grp01", label: "Group 1", checked: false }],
    status: ApiHealthStatus.HEALTHY,
  };
  await page.reload();
  await expect(page.getByText("Connected")).toBeVisible();
  await page.screenshot({ path: "group-added.png" });
});
