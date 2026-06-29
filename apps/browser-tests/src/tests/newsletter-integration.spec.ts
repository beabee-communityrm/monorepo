import { test, expect } from "@playwright/test";
import { adminAuthFile } from "../setup/auth-states";
import {
  ApiHealthStatus,
  NewsletterIntegrationDataWith,
} from "@beabee/beabee-common";

test.use({ storageState: adminAuthFile });

test("Integration health status and group refresh", async ({ page }) => {
  await test.step("Newsletter Integration Disabled", async () => {
    // Mock API response
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
      page.getByText(/disabled/i),
      "Disabled status visible",
    ).toBeVisible();
  });

  await test.step("Integration Enabled but Unhealthy", async () => {
    let response: NewsletterIntegrationDataWith<"health"> = {
      provider: "mailchimp",
      audienceId: "1a2b3c4d",
      groups: [],
      status: ApiHealthStatus.UNHEALTHY,
    };

    await page.route("/api/1.0/integrations/newsletter?with=health", (route) =>
      route.fulfill({ json: response }),
    );

    await page.goto("/admin/settings/integrations");
    await expect(
      page.getByText(/connection lost/i),
      "Disconnected status visible",
    ).toBeVisible();
  });

  await test.step("Integration Enabled and Healthy", async () => {
    let response: NewsletterIntegrationDataWith<"health"> = {
      provider: "mailchimp",
      audienceId: "1a2b3c4d",
      groups: [{ id: "grp01", label: "Group 1", checked: false }],
      status: ApiHealthStatus.HEALTHY,
    };

    await page.route("/api/1.0/integrations/newsletter?with=health", (route) =>
      route.fulfill({ json: response }),
    );

    await page.goto("/admin/settings/integrations");
    await expect(
      page.getByText(/connected/i),
      "Connected status visible",
    ).toBeVisible();
  });
});
