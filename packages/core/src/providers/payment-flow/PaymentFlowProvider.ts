import { JoinFlow } from '#models/index';
import {
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlow,
  PaymentFlowData,
} from '#type/index';

/**
 * Interface for payment flow providers that handle the initial payment setup process.
 * Each payment method (Stripe, GoCardless) implements this interface for its specific flow.
 */
export abstract class PaymentFlowProvider {
  /**
   * Creates a new payment flow with the provider
   * @param joinFlow - The join flow containing user and payment information
   * @param completeUrl - URL to redirect after successful setup
   * @param data - Additional data needed for the flow
   * @returns Promise resolving to created payment flow
   */
  abstract createPaymentFlow(
    joinFlow: JoinFlow,
    completeUrl: string,
    data: PaymentFlowData
  ): Promise<PaymentFlow>;

  /**
   * Completes a payment flow after provider setup
   * @param joinFlow - The join flow to complete
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
