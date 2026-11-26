import {
  ApiErrorCode,
  type ContactContributionData,
  ContributionPeriod,
  ContributionType,
  GetContactWith,
  MembershipStatus,
  type PaymentFlowResult,
  PaymentMethod,
  PaymentStatus,
  type Serial,
} from '@beabee/beabee-common';
import { BeabeeClient, ContactContributionClient } from '@beabee/client';
import { api, testUser } from '@beabee/test-utils/test-data';

import { describe, expect, it, onTestFinished } from 'vitest';

import { query } from '#utils/db.ts';
import {
  advanceTestClock,
  confirmSetupIntent,
  createTestClock,
  createTestClockCustomer,
  deleteTestClock,
  hasStripeKey,
} from '#utils/stripe.ts';
import { waitFor } from '#utils/wait.ts';

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

const client = new BeabeeClient({
  host: process.env.BEABEE_AUDIENCE ?? api.host,
  path: api.path,
  token: testUser.apiKey,
});

/**
 * Create a contact whose Stripe customer follows a test clock, and start the
 * setup of a monthly card contribution for them
 * @returns The contact ID, the clock ID and the setup intent's client secret
 */
async function startContribution() {
  const email = `stripe-clock-${Date.now()}@example.com`;

  const clockId = await createTestClock();
  onTestFinished(() => deleteTestClock(clockId));
  const customerId = await createTestClockCustomer(clockId, email);

  const contact = await client.contact.create({
    email,
    firstname: 'Test',
    lastname: 'Clock',
  });
  onTestFinished(() => client.contact.delete(contact.id));

  // The payment flow only keeps a customer whose payment method stays the same
  await query(
    'UPDATE contact_contribution SET method = $1, "customerId" = $2 WHERE "contactId" = $3',
    [PaymentMethod.StripeCard, customerId, contact.id]
  );

  const { data: flow } =
    await client.contact.contribution.fetch.post<PaymentFlowResult>(
      `/${contact.id}/contribution`,
      {
        amount: 5,
        period: ContributionPeriod.Monthly,
        payFee: false,
        prorate: false,
        paymentMethod: PaymentMethod.StripeCard,
        completeUrl: 'https://example.com/complete',
      }
    );
  if (!flow.clientSecret) {
    throw new Error('Payment flow has no client secret');
  }

  return { contactId: contact.id, clockId, clientSecret: flow.clientSecret };
}

async function completeContribution(contactId: string, paymentFlowId: string) {
  const { data } = await client.contact.contribution.fetch.post<
    Serial<ContactContributionData>
  >(`/${contactId}/contribution/complete`, { paymentFlowId });
  return ContactContributionClient.deserialize(data);
}

async function getContribution(contactId: string) {
  const { data } = await client.contact.contribution.fetch.get<
    Serial<ContactContributionData>
  >(`/${contactId}/contribution`);
  return ContactContributionClient.deserialize(data);
}

async function getSubscriptionId(contactId: string) {
  const [row] = await query<{ subscriptionId: string | null }>(
    'SELECT "subscriptionId" FROM contact_contribution WHERE "contactId" = $1',
    [contactId]
  );
  return row.subscriptionId;
}

/** Wait until the contact's payments, oldest first, have the given statuses */
async function waitForPayments(contactId: string, statuses: PaymentStatus[]) {
  return await waitFor(`payments to be ${statuses.join(', ')}`, async () => {
    const { items } = await client.contact.payment.list(contactId);
    items.sort((a, b) => +a.chargeDate - +b.chargeDate);
    return items.length === statuses.length &&
      items.every((payment, i) => payment.status === statuses[i])
      ? items
      : undefined;
  });
}

describe.skipIf(!hasStripeKey)(
  'Stripe contribution (needs BEABEE_STRIPE_SECRETKEY)',
  () => {
    it('starts a monthly contribution and renews it a month later', async () => {
      const { contactId, clockId, clientSecret } = await startContribution();

      const contribution = await completeContribution(
        contactId,
        await confirmSetupIntent(clientSecret, 'pm_card_visa')
      );

      expect(contribution).toMatchObject({
        type: ContributionType.Automatic,
        amount: 5,
        period: ContributionPeriod.Monthly,
        membershipStatus: MembershipStatus.Active,
        membershipExpiryDate: expect.any(Date),
        paymentSource: { method: PaymentMethod.StripeCard, last4: '4242' },
      });

      const [firstPayment] = await waitForPayments(contactId, [
        PaymentStatus.Successful,
      ]);
      expect(firstPayment.amount).toBe(5);

      await advanceTestClock(clockId, 32 * DAY);

      const payments = await waitForPayments(contactId, [
        PaymentStatus.Successful,
        PaymentStatus.Successful,
      ]);
      expect(payments[1].amount).toBe(5);

      const renewed = await waitFor('the membership to extend', async () => {
        const current = await getContribution(contactId);
        return current.membershipExpiryDate! >
          contribution.membershipExpiryDate!
          ? current
          : undefined;
      });
      expect(renewed.membershipStatus).toBe(MembershipStatus.Active);
    });

    it('revokes the membership when a first payment is never authenticated', async () => {
      const { contactId, clockId, clientSecret } = await startContribution();

      // The setup intent itself is left waiting for authentication too, as
      // only a browser can complete it. Completing the flow doesn't check
      await expect(
        completeContribution(
          contactId,
          await confirmSetupIntent(
            clientSecret,
            'pm_card_authenticationRequired'
          )
        )
      ).rejects.toMatchObject({ code: ApiErrorCode.PAYMENT_REQUIRES_ACTION });

      // The membership starts while the payment waits for authentication
      expect(await getContribution(contactId)).toMatchObject({
        type: ContributionType.Automatic,
        amount: 5,
        membershipStatus: MembershipStatus.Active,
      });
      expect(await getSubscriptionId(contactId)).not.toBeNull();
      await waitForPayments(contactId, [PaymentStatus.Pending]);

      // Stripe expires the subscription 23 hours after it was created
      await advanceTestClock(clockId, 24 * HOUR);

      await waitFor(
        'the subscription to be removed',
        async () => (await getSubscriptionId(contactId)) === null
      );
      await waitForPayments(contactId, [PaymentStatus.Cancelled]);

      const contact = await client.contact.get(contactId, [
        GetContactWith.Roles,
      ]);
      expect(contact.roles).toEqual([]);

      // Only the membership is revoked, the contribution itself is kept
      const contribution = await getContribution(contactId);
      expect(contribution).toMatchObject({
        type: ContributionType.Automatic,
        amount: 5,
        membershipStatus: MembershipStatus.None,
        paymentSource: { method: PaymentMethod.StripeCard, last4: '3184' },
      });
      expect(contribution.membershipExpiryDate).toBeUndefined();
    });
  }
);
