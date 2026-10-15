import Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Contact, ContactContribution } from '../models/index.js';
import ContactsService from '../services/ContactsService.js';
import PaymentService from '../services/PaymentService.js';
import { StripeWebhookEventHandler } from './stripe-webhook-event-handler.js';

const contact = Object.assign(new Contact(), { id: 'contact-1' });

function createContribution(
  nextAmount: ContactContribution['nextAmount']
): ContactContribution {
  return Object.assign(new ContactContribution(), { contact, nextAmount });
}

function createSubscription(
  overrides: Partial<Stripe.Subscription>
): Stripe.Subscription {
  // The handler only reads the fields set here
  return {
    id: 'sub_1',
    status: 'active',
    pending_update: null,
    cancellation_details: null,
    items: { data: [{ price: { unit_amount: 12000 } }] },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

function createEvent(
  type: 'customer.subscription.updated' | 'customer.subscription.deleted',
  object: Stripe.Subscription,
  previous_attributes?: Partial<Stripe.Subscription>
): Stripe.Event {
  // Only the fields the handler dispatches on
  return {
    id: 'evt_1',
    type,
    data: { object, previous_attributes },
  } as Stripe.Event;
}

describe('StripeWebhookEventHandler', () => {
  const cancelContactContribution = vi
    .spyOn(ContactsService, 'cancelContactContribution')
    .mockResolvedValue();
  const updateContact = vi
    .spyOn(ContactsService, 'updateContact')
    .mockResolvedValue();
  const updateData = vi.spyOn(PaymentService, 'updateData').mockResolvedValue();
  const getContributionBy = vi.spyOn(PaymentService, 'getContributionBy');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('customer.subscription.deleted', () => {
    it('sends the payment failed email when Stripe cancelled for failed payments', async () => {
      getContributionBy.mockResolvedValue(createContribution(null));

      await StripeWebhookEventHandler.handleEvent(
        createEvent(
          'customer.subscription.deleted',
          createSubscription({
            cancellation_details: {
              reason: 'payment_failed',
              comment: null,
              feedback: null,
            },
          })
        )
      );

      expect(cancelContactContribution).toHaveBeenCalledWith(
        contact,
        'cancelled-contribution-payment-failed'
      );
    });

    it('sends the cancelled email for any other cancellation', async () => {
      getContributionBy.mockResolvedValue(createContribution(null));

      await StripeWebhookEventHandler.handleEvent(
        createEvent(
          'customer.subscription.deleted',
          createSubscription({
            cancellation_details: {
              reason: 'cancellation_requested',
              comment: null,
              feedback: null,
            },
          })
        )
      );

      expect(cancelContactContribution).toHaveBeenCalledWith(
        contact,
        'cancelled-contribution'
      );
    });
  });

  describe('customer.subscription.updated', () => {
    const pendingUpdate = {
      expires_at: 0,
    } as Stripe.Subscription.PendingUpdate;

    it('activates the next amount when a pending update was applied', async () => {
      getContributionBy.mockResolvedValue(
        createContribution({ chargeable: 18000, monthly: 15 })
      );

      await StripeWebhookEventHandler.handleEvent(
        createEvent(
          'customer.subscription.updated',
          createSubscription({
            items: { data: [{ price: { unit_amount: 18000 } }] } as never,
          }),
          { pending_update: pendingUpdate }
        )
      );

      expect(updateContact).toHaveBeenCalledWith(contact, {
        contributionMonthlyAmount: 15,
      });
      expect(updateData).toHaveBeenCalledWith(contact, { nextAmount: null });
    });

    it('clears the next amount when a pending update expired unpaid', async () => {
      getContributionBy.mockResolvedValue(
        createContribution({ chargeable: 18000, monthly: 15 })
      );

      await StripeWebhookEventHandler.handleEvent(
        createEvent('customer.subscription.updated', createSubscription({}), {
          pending_update: pendingUpdate,
        })
      );

      expect(updateContact).not.toHaveBeenCalled();
      expect(updateData).toHaveBeenCalledWith(contact, { nextAmount: null });
    });

    it('ignores an update that is still pending', async () => {
      getContributionBy.mockResolvedValue(
        createContribution({ chargeable: 18000, monthly: 15 })
      );

      await StripeWebhookEventHandler.handleEvent(
        createEvent(
          'customer.subscription.updated',
          createSubscription({ pending_update: pendingUpdate }),
          { pending_update: null }
        )
      );

      expect(updateContact).not.toHaveBeenCalled();
      expect(updateData).not.toHaveBeenCalled();
    });
  });
});
