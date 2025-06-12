import {
  Event,
  EventResourceType,
  PaymentStatus,
} from 'gocardless-nodejs/types/Types';

import { log as mainLogger } from '#logging';
import {
  cancelMandate,
  cancelSubscription,
  updatePayment,
  updatePaymentStatus,
} from '#utils/gocardless';

import gocardless from './gocardless';

const log = mainLogger.child({ app: 'gocardless-webhook-handler' });

/**
 * Handles all incoming GoCardless webhook events and processes them according to their type.
 * This class contains methods for managing subscriptions, payments, mandates and refunds
 * in response to GoCardless events.
 */
export class GoCardlessWebhookEventHandler {
  /**
   * Main entry point for processing GoCardless webhook events
   * Routes each event to the appropriate handler based on its resource type
   * @param events Array of incoming GoCardless webhook events
   */
  static async handleEvents(events: Event[]): Promise<void> {
    log.info(`Processing ${events.length} events`);

    for (const event of events) {
      log.info(
        `Processing ${event.action} on ${event.resource_type}: ${JSON.stringify(
          event.links
        )}`
      );

      await this.handleEventResource(event);
    }
  }

  /**
   * Routes an event to the appropriate handler based on its resource type
   * @param event The GoCardless event to process
   */
  private static async handleEventResource(event: Event): Promise<void> {
    switch (event.resource_type) {
      case EventResourceType.Payments:
        return await this.handlePaymentResourceEvent(event);
      case EventResourceType.Subscriptions:
        return await this.handleSubscriptionResourceEvent(event);
      case EventResourceType.Mandates:
        return await this.handleMandateResourceEvent(event);
      case EventResourceType.Refunds:
        return await this.handleRefundResourceEvent(event);
      default:
        log.info('Unhandled event', event);
        break;
    }
  }

  /**
   * Handles payment-related events
   * For paid_out events, only updates the payment status to avoid rate limiting
   * For other events, fetches the latest payment details and updates accordingly
   * @param event The payment-related event
   */
  private static async handlePaymentResourceEvent(event: Event): Promise<void> {
    // GC sends a paid_out action per payment when a payout is processed, which
    // means 1,000s of events. In the docs they say you should always fetch the
    // related payment to check it hasn't changed, but if we do that we get rate
    // limited. It seems like we can pretty safely assume paid out payments
    // haven't changed though.
    if (event.action === PaymentStatus.PaidOut) {
      await updatePaymentStatus(event.links!.payment!, PaymentStatus.PaidOut);
    } else {
      await updatePayment(event.links!.payment!, event.action);
    }
  }

  /**
   * Handles subscription-related events
   * Processes subscription creation, approval, cancellation and completion events
   * @param event The subscription-related event
   */
  private static async handleSubscriptionResourceEvent(
    event: Event
  ): Promise<void> {
    switch (event.action) {
      case 'created':
      case 'customer_approval_granted':
      case 'payment_created':
      case 'amended':
        // Do nothing, we already have the details on file
        break;
      case 'customer_approval_denied':
      case 'cancelled':
      case 'finished':
        await cancelSubscription(event.links!.subscription!);
        break;
    }
  }

  /**
   * Handles mandate-related events
   * Processes mandate creation, approval, cancellation and failure events
   * @param event The mandate-related event
   */
  private static async handleMandateResourceEvent(event: Event): Promise<void> {
    switch (event.action) {
      case 'created':
      case 'customer_approval_granted':
      case 'customer_approval_skipped':
      case 'submitted':
      case 'active':
      case 'transferred':
        // Do nothing, we already have the details on file
        break;
      case 'reinstated':
        log.error(
          "Mandate reinstated, its likely this mandate won't be linked to a member...",
          event
        );
        break;
      case 'cancelled':
      case 'failed':
      case 'expired':
        // Remove the mandate from the database
        await cancelMandate(event.links!.mandate!);
        break;
    }
  }

  /**
   * Handles refund-related events
   * Fetches the latest refund details and updates the associated payment
   * @param event The refund-related event
   */
  private static async handleRefundResourceEvent(event: Event): Promise<void> {
    const refund = await gocardless.refunds.get(event.links!.refund!);
    await updatePayment(refund.links!.payment!);
  }
}
