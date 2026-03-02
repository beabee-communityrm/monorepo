import { PaymentFlowParams } from '@beabee/beabee-common';

import { PaymentFlow } from '#models/index';
import {
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlowData,
  PaymentFlowSetup,
} from '#type/index';

/**
 * Interface for payment flow providers that handle the initial payment setup process.
 * Each payment method (Stripe, GoCardless) implements this interface for its specific flow.
 */
export abstract class PaymentFlowProvider {
  /**
   * Creates a new payment flow with the provider
   * @param flow - The payment flow containing user and payment information
   * @param data - Additional data needed for the flow
   * @returns Promise resolving to created payment flow
   */
  abstract setupPaymentFlow(
    flow: PaymentFlow,
    data: PaymentFlowData
  ): Promise<PaymentFlowSetup>;

  /**
   * Completes a payment flow after provider setup
   * @param flow - The payment flow to complete
   * @returns Promise resolving to completed payment flow
   */
  abstract completePaymentFlow(
    flow: PaymentFlow
  ): Promise<CompletedPaymentFlow>;

  /**
   * Retrieves data from a completed payment flow
   * @param completedPaymentFlow - The completed flow to get data from
   * @returns Promise resolving to payment flow data
   */
  abstract getCompletedPaymentFlowData(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<CompletedPaymentFlowData>;
}
