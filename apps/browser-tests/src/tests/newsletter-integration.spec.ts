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
      page.getByText(new RegExp(`audience id: ${response.audienceId}`, "i")),
      "Audience ID visible",
    ).toBeVisible();

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

    // GET interceptor
    await page.route("/api/1.0/integrations/newsletter?with=health", (route) =>
      route.fulfill({ json: response }),
    );

    // POST interceptor
    const refreshResponse = {
      info: {
        provider: "mailchimp",
        audienceId: "1a2b3c4d",
        groups: [{ id: "grp02", label: "Group 2", checked: false }],
        status: ApiHealthStatus.HEALTHY,
      },
      groupChanges: [
        { id: "grp02", label: "Group 2", action: "added" },
        { id: "grp01", label: "Group 1", action: "removed" },
      ],
    };

    await page.goto("/admin/settings/integrations");
    await expect(
      page.getByText(/connected/i),
      "Connected status visible",
    ).toBeVisible();

    const groupTableEntry = page.getByRole("row", {
      name: /grp01.*group 1/i,
    });
    await expect(groupTableEntry, "Group entry visible").toBeVisible();

    await page.route("/api/1.0/integrations/newsletter/refresh", (route) =>
      route.fulfill({ json: refreshResponse }),
    );

    const refreshBtn = page.getByRole("button", { name: /refresh/i });

    await expect(refreshBtn, "Refresh button visible").toBeVisible();
    await refreshBtn.click();

    await expect(
      page.getByText(/mailchimp groups added: group 2/i),
      "Add group notification visible",
    ).toBeVisible();

    await expect(
      page.getByText(/mailchimp groups removed: group 1/i),
      "Remove group notification visible",
    ).toBeVisible();

    await expect(groupTableEntry, "Old group not visible").not.toBeVisible();
    await expect(
      page.getByRole("row", { name: /grp02.*group 2/i }),
      "New group visible",
    ).toBeVisible();
  });

  await test.step("Refresh fails", async () => {
    let response: NewsletterIntegrationDataWith<"health"> = {
      provider: "mailchimp",
      audienceId: "1a2b3c4d",
      groups: [{ id: "grp01", label: "Group 1", checked: false }],
      status: ApiHealthStatus.HEALTHY,
    };

    await page.route("/api/1.0/integrations/newsletter?with=health", (route) =>
      route.fulfill({ json: response }),
    );

    // Abort refresh POST so the request fails
    await page.route("/api/1.0/integrations/newsletter/refresh", (route) =>
      route.abort(),
    );

    await page.goto("/admin/settings/integrations");

    const refreshBtn = page.getByRole("button", { name: /refresh/i });
    await expect(refreshBtn, "Refresh button visible").toBeVisible();
    await refreshBtn.click();

    await expect(
      page.getByText(/mailchimp refresh failed\. please try again\./i),
      "Refresh failure notification visible",
    ).toBeVisible();
  });
});
