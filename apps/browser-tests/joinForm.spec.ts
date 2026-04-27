import { test, expect } from '@playwright/test';

let emailAddress : string;
let confirmationLink : string | null;
let firstName : string;
let lastName : string;
let testPw: string;
let contributionDate : string;
let contributionAmount = '36';

test.describe.configure({ mode: 'serial' }); // Run tests in serial mode since they're dependent on each other

test.beforeAll(async ( browserName ) => {
  emailAddress = "firefox_playwright@example.com";
  firstName = browserName.browserName;
  lastName = 'Playwright';
  contributionDate = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  testPw = '';
});

test('Join Form', async ({ page }) => {
  await page.goto('/join');

  // Locate payment form fields and fill them
  await page.getByRole('radio', { name: 'One-time' }).click();
  await page.getByRole('radio', {name: new RegExp(`\\D*${contributionAmount}\\.\\d+`) }).click();

  await page.getByRole('textbox', { name: 'Email' }).fill(emailAddress);
  await page.getByRole('button', { name: 'card' }).click();

  expect(page.getByRole('button', { name: /contribute/i }), "Contribute button enabled").toBeEnabled(); // If the form was filled correctly, button should be enabled

  // Proceed to payment page
  await page.getByRole('button', { name: /contribute/i }).click();
  
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);

  await page.locator('iframe[src*="stripe.com"]').first().contentFrame().locator('#payment-numberInput').fill('4242 4242 4242 4242');
  await page.locator('iframe[src*="stripe.com"]').first().contentFrame().locator('#payment-expiryInput').fill('12/30');
  await page.locator('iframe[src*="stripe.com"]').first().contentFrame().locator('#payment-cvcInput').fill('111');
  
  expect(page.getByRole('button', { name: /continue/i }), "Continue button enabled").toBeEnabled();
  await page.getByRole('button', { name: /continue/i }).click();

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

test('Confirmation email', async ({ page }) => {
  await page.goto(`http://localhost:${process.env.MAIL_PORT || 3025}/`);

  // Check that the page does not say 'no emails'
  await expect(page.getByText('No emails'), "Inbox not empty").not.toBeVisible();

  await page.locator('.email-item-link').filter({
    hasText: 'Do you want to setup an account?',
    has: page.locator(`span[title*="${emailAddress}"]`)
  }).first().click();

  await expect(page.locator('iframe').first().contentFrame().getByRole('link', { name: 'Setup account' }), "Setup link visible").toBeVisible();
  
  let setupAccountLink = await page.locator('iframe').first().contentFrame().getByRole('link', { name: 'Setup account' })
  confirmationLink = await setupAccountLink.getAttribute('href');
});

test('Set password', async({ page, browserName }) => {
  expect (confirmationLink, "Setup link is non-empty").not.toHaveLength(0);

  if (!confirmationLink) // This is here just as a sanity check
  {
    console.log('Confirmation link not found');
    return; 
  }
  await page.goto(confirmationLink);

  // Set password
  await page.locator('input[name="password"]').fill(testPw);

  // Continue
  await expect(page.getByRole('button', { name: /continue/i }), "Set password enabled").toBeEnabled();
  await page.getByRole('button', { name: /continue/i }).click();

  // Uncomment for survey page
  // await page.waitForURL('/join/survey');
  // await page.getByRole('button', { name: 'Skip' }).click(); // Skip survey for now

  // When survey is disabled, user is taken to their profile directly
  await page.waitForURL(/\/profile/);
});

test('Contribution', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('input[name="email"]').fill(emailAddress);
  await page.locator('input[name="password"]').fill(testPw);


  await expect(page.getByRole('button', { name: /login/i }), "Login button enabled").toBeEnabled();
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL(/\/profile/);
  console.log("Login successful");

  await page.getByRole('link', { name: 'Contribution' }).click();
  await page.waitForURL('/profile/contribution');

  await expect(page.getByRole('heading', { name: 'Payment history' }), "Payment history visible").toBeVisible();

  // Locate row with one-time contribution
  const targetRow = page.locator('tr').filter({hasText: contributionDate})
  .filter({hasText: new RegExp(`\\D*${contributionAmount}\\.\\d+`),})
  .filter({hasText: 'one-time',});

  // Assert that the row is visible
  await expect(targetRow, "Payment date and amount visible").toBeVisible();
});