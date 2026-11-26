import Stripe from 'stripe';

import { waitFor } from './wait.ts';

const secretKey = process.env.BEABEE_STRIPE_SECRETKEY;

export const hasStripeKey = !!secretKey;

let client: Stripe | undefined;

function stripe(): Stripe {
  if (!secretKey?.startsWith('sk_test_')) {
    throw new Error('BEABEE_STRIPE_SECRETKEY must be a test mode key');
  }
  // Must match the version the stack itself uses
  client ||= new Stripe(secretKey, { apiVersion: '2024-04-10' });
  return client;
}

/**
 * Create a test clock starting at the current time
 * @returns The ID of the clock
 */
export async function createTestClock(): Promise<string> {
  const clock = await stripe().testHelpers.testClocks.create({
    frozen_time: Math.floor(Date.now() / 1000),
    name: 'beabee e2e test',
  });
  return clock.id;
}

/**
 * Create a customer whose subscriptions follow a test clock. Stripe only binds
 * a customer to a clock when it is created
 * @returns The ID of the customer
 */
export async function createTestClockCustomer(
  clockId: string,
  email: string
): Promise<string> {
  const customer = await stripe().customers.create({
    test_clock: clockId,
    email,
    metadata: { beabee: 'e2e-test' },
  });
  return customer.id;
}

/**
 * Move a test clock forward and wait until Stripe has processed everything
 * that happened in between
 */
export async function advanceTestClock(
  clockId: string,
  seconds: number
): Promise<void> {
  const clock = await stripe().testHelpers.testClocks.retrieve(clockId);
  await stripe().testHelpers.testClocks.advance(clockId, {
    frozen_time: clock.frozen_time + seconds,
  });
  await waitFor(
    'test clock to finish advancing',
    async () =>
      (await stripe().testHelpers.testClocks.retrieve(clockId)).status ===
      'ready'
  );
}

/** Delete a test clock along with its customers and their subscriptions */
export async function deleteTestClock(clockId: string): Promise<void> {
  await stripe().testHelpers.testClocks.del(clockId);
}

/**
 * Confirm a setup intent with a test payment method, as Stripe Elements would
 * do in the browser
 * @returns The ID of the setup intent
 */
export async function confirmSetupIntent(
  clientSecret: string,
  paymentMethod: string
): Promise<string> {
  const [id] = clientSecret.split('_secret_');
  await stripe().setupIntents.confirm(id, { payment_method: paymentMethod });
  return id;
}
