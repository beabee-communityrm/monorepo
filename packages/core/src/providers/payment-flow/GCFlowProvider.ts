import gocardless from '#lib/gocardless';
import { log as mainLogger } from '#logging';
import { JoinFlow } from '#models/index';
import {
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlow,
  PaymentFlowData,
} from '#type/index';

import { PaymentFlowProvider } from './PaymentFlowProvider';

const log = mainLogger.child({ app: 'gc-payment-flow-provider' });

/**
 * Implements PaymentFlowProvider for GoCardless direct debit payments.
 * Handles the setup of direct debit mandates through the GoCardless redirect flow.
 */
class GCFlowProvider implements PaymentFlowProvider {
  /**
   * Creates a GoCardless redirect flow for direct debit setup
   * @param joinFlow - Join flow containing user information
   * @param completeUrl - URL to redirect after mandate setup
   * @param data - Additional customer data
   * @returns Promise resolving to payment flow with redirect URL
   */
  async createPaymentFlow(
    joinFlow: JoinFlow,
    completeUrl: string,
    params: PaymentFlowData
  ): Promise<PaymentFlow> {
    const redirectFlow = await gocardless.redirectFlows.create({
      session_token: joinFlow.id,
      success_redirect_url: completeUrl,
      prefilled_customer: {
        email: params.email,
        ...(params.firstname && { given_name: params.firstname }),
        ...(params.lastname && { family_name: params.lastname }),
      },
    });
    log.info('Created redirect flow ' + redirectFlow.id);

    return {
      id: redirectFlow.id!,
      params: {
        redirectUrl: redirectFlow.redirect_url!,
      },
    };
  }

  /**
   * Completes the GoCardless redirect flow and retrieves mandate
   * @param joinFlow - Join flow to complete
   * @returns Promise resolving to completed payment flow with mandate ID
   */
  async completePaymentFlow(joinFlow: JoinFlow): Promise<CompletedPaymentFlow> {
    const redirectFlow = await gocardless.redirectFlows.complete(
      joinFlow.paymentFlowId,
      {
        session_token: joinFlow.id,
      }
    );
    log.info('Completed redirect flow ' + redirectFlow.id);

    return {
      joinForm: joinFlow.joinForm,
      customerId: redirectFlow.links!.customer!,
      mandateId: redirectFlow.links!.mandate!,
    };
  }

  /**
   * Retrieves additional data from completed payment flow
   * @param completedPaymentFlow - The completed flow
   * @returns Promise resolving to payment flow data including billing address
   */
  async getCompletedPaymentFlowData(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<CompletedPaymentFlowData> {
    const customer = await gocardless.customers.get(
      completedPaymentFlow.customerId
    );

    return {
      ...(customer.given_name && { firstname: customer.given_name }),
      ...(customer.family_name && { lastname: customer.family_name }),
      billingAddress: {
        line1: customer.address_line1 || '',
        line2: customer.address_line2 || undefined,
        city: customer.city || '',
        postcode: customer.postal_code || '',
      },
    };
  }
}

export const gcFlowProvider = new GCFlowProvider();
/** @deprecated Use gcFlowProvider instead */
export default gcFlowProvider;
