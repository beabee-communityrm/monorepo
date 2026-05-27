import { test, expect } from "@playwright/test";
import { cardInfo, signIn } from "#fixtures/user-info.json";

const email: string = signIn.email;
const testPw: string = signIn.password;
const contributionAmount = "5";
let contributionDate = new Date().toLocaleString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

test("One-time contribution after login", async ({ page }) => {
  // 1. Log in
  await page.goto("/auth/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(testPw);

  await expect(
    page.getByRole("button", { name: /login/i }),
    "Login button enabled",
  ).toBeEnabled();
  await page.getByRole("button", { name: /login/i }).click();

  await page.waitForURL(/\/profile/);
  console.log("Login successful");

  // 2. make one-time contribution
  await page.getByRole("link", { name: /contribution/i }).click();
  await page.waitForURL("/profile/contribution");
  await page.getByRole("button", { name: /one-time/i }).click();
  await page
    .getByRole("radio", {
      name: new RegExp(`\\D*${contributionAmount}\\.\\d+`),
    })
    .click();

  await page.getByRole("button", { name: /Make contribution/i }).click();
  await expect(
    page.getByText("Your card details"),
    "Payment pop-up shows up",
  ).toBeVisible();

  const stripeFrame = await page
    .locator('iframe[src*="stripe.com"]')
    .first()
    .contentFrame();

  await stripeFrame.locator("#payment-numberInput").fill(cardInfo.number);
  await stripeFrame.locator("#payment-expiryInput").fill(cardInfo.validUntil);
  await stripeFrame.locator("#payment-cvcInput").fill(cardInfo.cvv);
  await stripeFrame.locator("#payment-countryInput").selectOption("DE");
  await page.getByRole("button", { name: /continue/i }).click();

  await page
    .getByText("Thank you for your contribution!")
    .waitFor({ state: "visible" });

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Payment history" }),
    "Payment history visible",
  ).toBeVisible();

  const targetRow = page
    .locator("tr")
    .filter({ hasText: contributionDate })
    .filter({ hasText: new RegExp(`\\D*${contributionAmount}\\.\\d+`) })
    .filter({ hasText: "one-time" })
    .first();

  await expect(targetRow, "Payment date and amount visible").toBeVisible();
});
