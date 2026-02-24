import { PaymentFlowParams } from '@beabee/beabee-common';

import { JoinFlow } from '#models/index';
import {
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlow,
} from '#type/index';

/**
 * Interface for payment flow providers that handle the initial payment setup process.
 * Each payment method (Stripe, GoCardless) implements this interface for its specific flow.
 */
export abstract class PaymentFlowProvider {
  /**
   * Creates a new payment flow with the provider
   * @param joinFlow - The join flow containing user and payment information
   * @param params - Parameters for the payment flow
   * @returns Promise resolving to created payment flow
   */
  abstract createPaymentFlow(
    joinFlow: JoinFlow,
    params: PaymentFlowParams
  ): Promise<PaymentFlow>;

  /**
   * Completes a payment flow after provider setup
   * @param joinFlow - The join flow to complete
   * @param params - Parameters for the payment flow
   * @returns Promise resolving to completed payment flow
   */
  abstract completePaymentFlow(
    joinFlow: JoinFlow
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
