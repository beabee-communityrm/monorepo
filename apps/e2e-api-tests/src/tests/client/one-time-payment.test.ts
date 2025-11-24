import { PaymentMethod } from '@beabee/beabee-common';
import { BeabeeClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import Stripe from 'stripe';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('One-Time Payment', () => {
  let client: BeabeeClient;
  let adminClient: BeabeeClient;
  let stripe: Stripe;
  let testClock: Stripe.TestHelpers.TestClock;

  beforeAll(async () => {
    client = new BeabeeClient({ host: HOST, path: PATH });
    adminClient = new BeabeeClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });
    stripe = new Stripe(process.env.BEABEE_STRIPE_SECRETKEY!);

    testClock = await stripe.testHelpers.testClocks.create({
      frozen_time: Math.floor(Date.now() / 1000),
    });
  });

  afterAll(async () => {
    if (testClock?.id) {
      await stripe.testHelpers.testClocks.del(testClock.id);
    }
  });

  it('should complete full one-time payment signup flow with fee', async () => {
    const email = `test-${Date.now()}@example.com`;
    const amount = 25;

    // 1. Start signup with one-time payment
    const signupResponse = await client.signup.start({
      email,
      oneTimePayment: {
        amount,
        paymentMethod: PaymentMethod.StripeCard,
        payFee: true,
        completeUrl: `${HOST}/join/complete`,
      },
    });

    const clientSecret = signupResponse?.clientSecret;
    expect(clientSecret).toBeDefined();

    // 2. Parse setup intent ID and verify it was created correctly
    const setupIntentId = clientSecret?.split('_secret_')[0];
    expect(setupIntentId).toBeDefined();
    expect(setupIntentId).toMatch(/^seti_/); // Verify it starts with seti_

    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId!);
    expect(setupIntent.status).toBe('requires_payment_method');

    // 3. Simulate confirming the setup with a payment method
    await stripe.setupIntents.confirm(setupIntentId!, {
      payment_method: 'pm_card_visa', // Test card
    });

    // 4. Verify setup was successful
    const updatedSetupIntent = await stripe.setupIntents.retrieve(
      setupIntentId!
    );
    expect(updatedSetupIntent.status).toBe('succeeded');
    expect(updatedSetupIntent.payment_method).toBeDefined();

    // 5. Complete signup flow
    // This finds the JoinFlow by paymentFlowId and sends confirmation email
    const completeResponse = await client.signup.complete({
      paymentFlowId: setupIntentId!,
      firstname: 'Test',
      lastname: 'User',
    });

    // 7. Simulate email confirmation by getting joinFlowId from database

    // 8. Verify contact was created

    // 9. Verify invoice was created in Stripe (happens during email confirmation)
  });

  it('should handle declined payment correctly', async () => {});

  it('should complete payment flow without fee', async () => {});
});
