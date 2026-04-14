import {
  PaymentFlowSetupParams,
  PaymentFlowSetupResult,
} from '@beabee/beabee-common';

import { NoPaymentMethod } from '#errors/NoPaymentMethod';
import { stripe } from '#lib/stripe';
import { PaymentFlow } from '#models/index';
import { CompletedPaymentFlow, CompletedPaymentFlowData } from '#type/index';

import { PaymentFlowProvider } from './PaymentFlowProvider';

/**
 * Implements PaymentFlowProvider for Stripe payment methods.
 * Stripe flows are handled almost entirely client-side using confirmation
 * tokens so this provider doesn't do very much.
 */
class StripeFlowProvider implements PaymentFlowProvider {
  /**
   * Setup a Stripe payment flow. No server-side communication with Stripe
   * is needed for this.
   * @param flow - Payment flow containing payment method selection
   */
  async setupPaymentFlow(
    flow: PaymentFlow,
    _params: PaymentFlowSetupParams
  ): Promise<PaymentFlowSetupResult> {
    return {
      // There is no specific provider ID for Stripe payment flows so just
      // return our own flow ID. In practice this won't be used.
      id: flow.id,
    };
  }

  /**
   * Completes a payment flow. No server-side communication with Stripe is
   * needed for this, the confirmation token is applied when processing the
   * payment flow.
   * @param flow - Payment flow to complete
   * @returns The payment flow
   */
  async completePaymentFlow(flow: PaymentFlow): Promise<CompletedPaymentFlow> {
    return { flow, customerId: '', mandateId: '' };
  }

  /**
   * Retrieves payment method details from a completed flow
   * @param completedPaymentFlow - The completed payment flow
   * @returns Promise resolving to payment flow data including billing details
   */
  async getCompletedPaymentFlowData({
    flow,
  }: CompletedPaymentFlow): Promise<CompletedPaymentFlowData> {
    if (!flow.params?.token) {
      throw new NoPaymentMethod();
    }

    const token = await stripe.confirmationTokens.retrieve(flow.params.token);

    const address = token.payment_method_preview?.billing_details.address;

    return {
      firstname: flow.params.firstname || '',
      lastname: flow.params.lastname || '',
      ...(address && {
        billingAddress: {
          line1: address.line1 || '',
          line2: address.line2 || undefined,
          city: address.city || '',
          postcode: address.postal_code || '',
        },
      }),
    };
  }
}

export const stripeFlowProvider = new StripeFlowProvider();
/** @deprecated Use stripeFlowProvider instead */
export default stripeFlowProvider;
