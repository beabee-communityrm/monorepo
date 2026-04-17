import { test, expect } from '@playwright/test';

let testEmail = 'firefox_playwright@example.com'; // this needs to change with each browser

test('Join Form', async ({ page, browserName }) => {
  await page.goto('/');

  // Locate payment form fields and fill them
  await page.getByRole('radio', { name: 'Einmalig' }).click();
  await page.getByRole('radio', { name: /36/ }).click();

  await page.getByRole('textbox', { name: 'E-Mail' }).fill(testEmail);
  await page.getByRole('button', { name: 'Select Kreditkarte payment' }).click();

  await expect(page.getByRole('button', { name: /mit/i })).toBeEnabled(); // If the form was filled correctly, button should be enabled

  // Proceed to payment page
  await page.getByRole('button', { name: /mit/i }).click();

  await page.locator('input[name="firstName"]').fill(browserName);
  await page.locator('input[name="lastName"]').fill('Playwright');

  await page.locator('iframe[src*="stripe.com"]').first().contentFrame().locator('#payment-numberInput').fill('4242 4242 4242 4242');
  await page.locator('iframe[src*="stripe.com"]').first().contentFrame().locator('#payment-expiryInput').fill('12/30');
  await page.locator('iframe[src*="stripe.com"]').first().contentFrame().locator('#payment-cvcInput').fill('111');
  
  await expect(page.getByRole('button', { name: /weiter/i })).toBeEnabled();
  await page.getByRole('button', { name: /weiter/i }).click();

  await page.waitForRequest(request =>
    request.method() === 'POST' && request.url().includes('/signup/complete'),
    { timeout: 30000 }
  );
  await page.waitForResponse(response =>
    response.request().method() === 'POST' && 
    response.request().url().includes('/signup/complete') &&
    response.status() === 204,
    { timeout: 30000 }
  );
});

test('Confirmation Email', async ({ page }) => {
  await page.goto('/');
});