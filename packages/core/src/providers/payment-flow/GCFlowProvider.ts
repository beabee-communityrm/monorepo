import { PaymentFlowParamsGoCardless } from '@beabee/beabee-common';

import gocardless from '#lib/gocardless';
import { log as mainLogger } from '#logging';
import { PaymentFlow } from '#models/index';
import {
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlowSetup,
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
   * @param flow - Payment flow containing user information
   * @param params - Parameters for the payment flow
   * @param data - Additional customer data
   * @returns Promise resolving to payment flow with redirect URL
   */
  async setupPaymentFlow(
    flow: PaymentFlow<PaymentFlowParamsGoCardless>
  ): Promise<PaymentFlowSetup> {
    const redirectFlow = await gocardless.redirectFlows.create({
      session_token: flow.id,
      success_redirect_url: flow.params.completeUrl,
    });
    log.info('Created redirect flow ' + redirectFlow.id);

    return {
      id: redirectFlow.id!,
      result: {
        redirectUrl: redirectFlow.redirect_url!,
      },
    };
  }

  /**
   * Completes the GoCardless redirect flow and retrieves mandate
   * @param flow - Payment flow to complete
   * @returns Promise resolving to completed payment flow with mandate ID
   */
  async completePaymentFlow(
    flow: PaymentFlow<PaymentFlowParamsGoCardless>
  ): Promise<CompletedPaymentFlow> {
    const redirectFlow = await gocardless.redirectFlows.complete(
      flow.paymentFlowId,
      {
        session_token: flow.id,
      }
    );
    log.info('Completed redirect flow ' + redirectFlow.id);

    return {
      params: flow.params,
      form: flow.form,
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
      firstname: customer.given_name || '',
      lastname: customer.family_name || '',
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
