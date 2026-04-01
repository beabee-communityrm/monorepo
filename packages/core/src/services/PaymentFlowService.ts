import {
  PaymentFlowAdvanceParams,
  PaymentFlowResult,
  PaymentFlowSetupParams,
  PaymentMethod,
} from '@beabee/beabee-common';

import { getRepository } from '#database';
import { CantUpdateContribution, NotFoundError } from '#errors/index';
import { log as mainLogger } from '#logging';
import { Contact, PaymentFlow } from '#models/index';
import {
  gcFlowProvider,
  stripeFlowProvider,
} from '#providers/payment-flow/index';
import ContactsService from '#services/ContactsService';
import PaymentService from '#services/PaymentService';
import {
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlowForm,
  PaymentFlowSetup,
} from '#type/index';

const log = mainLogger.child({ app: 'payment-flow-service' });

/**
 * Service that manages the complete payment flow process in beabee.
 * Coordinates between different payment providers and handles the setup of new payment methods.
 */
class PaymentFlowService {
  /**
   * Starts a payment flow with contribution details
   * @param form - Complete payment flow form with payment details
   * @param params - Initial payment flow parameters
   * @returns Promise resolving to payment flow parameters
   */
  async startPaymentFlow(
    form: PaymentFlowForm,
    params: PaymentFlowSetupParams
  ): Promise<{ flow: PaymentFlow; result: PaymentFlowResult }> {
    const flow = await getRepository(PaymentFlow).save({
      form,
      method: params.paymentMethod,
      paymentFlowId: '',
      params: {}, // TODO:
    });

    log.info('Creating payment registration flow ' + flow.id, { form });

    const setup = await this.setupPaymentFlow(flow, params);
    await getRepository(PaymentFlow).update(flow.id, {
      paymentFlowId: setup.id,
    });

    return { flow, result: setup.result };
  }

  /**
   * Advances a payment flow with additional user data
   * @param flowId - The ID of the payment flow to advance
   * @param params - Additional parameters for the payment flow
   * @returns Promise resolving to updated payment flow
   */
  async advancePaymentFlow(
    flowId: string,
    params: PaymentFlowAdvanceParams
  ): Promise<void> {
    // Update the flow with advance parameters
    const result = await getRepository(PaymentFlow).update(flowId, {
      params,
    });

    if (result.affected === 0) {
      throw new NotFoundError();
    }

    log.info('Advanced payment flow ' + flowId);
  }

  /**
   * Completes a payment flow after payment provider confirms the
   * new payment method is set up, updating the contact's payment details.
   *
   * @param contact - The contact
   * @param paymentFlowId - The ID of the payment flow to complete
   */
  async completePaymentFlowAndProcess(
    contact: Contact,
    paymentFlowId: string
  ): Promise<void> {
    const flow = await getRepository(PaymentFlow).findOneBy({
      paymentFlowId,
    });
    if (!flow) {
      throw new NotFoundError();
    }

    // Use atomic update to prevent multiple simultaneous attempts to finalize
    // the same flow
    const res = await getRepository(PaymentFlow).update(
      { id: flow.id, processing: false },
      { processing: true }
    );
    if (res.affected === 0) {
      return;
    }

    const completedPaymentFlow = await this.completePaymentFlow(flow);
    await this.processCompletedFlow(contact, completedPaymentFlow);
  }

  /**
   * Completes a payment flow and returns additional contact data from the provider
   * @param flow - The payment flow entity to complete
   * @returns Payment flow data and additional contact information
   */
  async completePaymentFlowAndGetData(flow: PaymentFlow): Promise<
    | {
        flow: CompletedPaymentFlow;
        data: CompletedPaymentFlowData;
      }
    | undefined
  > {
    // Use atomic update to prevent multiple simultaneous attempts to finalize
    // the same flow
    const res = await getRepository(PaymentFlow).update(
      { id: flow.id, processing: false },
      { processing: true }
    );
    if (res.affected === 0) {
      return;
    }

    const completedPaymentFlow = await this.completePaymentFlow(flow);
    const data = await this.getCompletedPaymentFlowData(completedPaymentFlow);

    return { flow: completedPaymentFlow, data };
  }

  /**
   * Executes the actual payment actions after a payment flow is completed.
   * For recurring contributions: updates payment method and contribution details.
   * For one-time payments: processes the payment and sends confirmation.
   *
   * @param contact - The contact receiving the payment actions
   * @param completedFlow - The completed payment flow data
   */
  async processCompletedFlow(
    contact: Contact,
    completedFlow: CompletedPaymentFlow
  ): Promise<void> {
    const form = completedFlow.flow.form;

    const canChange = await PaymentService.canProcessPaymentFlow(contact, form);
    if (!canChange) {
      throw new CantUpdateContribution();
    }

    const result = await PaymentService.processCompletedFlow(
      contact,
      completedFlow
    );
    if (result) {
      await ContactsService.handleUpdateContributionResult(contact, result);
    }
  }

  /**
   * Create a new payment flow for the given payment flow, dispatching to the
   * appropriate provider and returning the created payment flow.
   *
   * @param flow The payment flow
   * @param completeUrl The completion URL for the payment flow
   * @param data The payment flow data
   * @returns The created payment flow
   */
  private async setupPaymentFlow(
    flow: PaymentFlow,
    params: PaymentFlowSetupParams
  ): Promise<PaymentFlowSetup> {
    log.info('Create payment flow for payment flow ' + flow.id);

    // There is probably a nicer way to narrow the type and dispatch to the
    // correct provider, but this is straightforward and works for now
    if (flow.method === PaymentMethod.GoCardlessDirectDebit) {
      return gcFlowProvider.setupPaymentFlow(flow, params as any);
    } else {
      return stripeFlowProvider.setupPaymentFlow(flow, params as any);
    }
  }

  /**
   * Complete the payment flow for the given payment flow, dispatching to the
   * appropriate provider and returning the completed payment flow
   *
   * @param flow  The payment flow
   * @returns The completed payment flow
   */
  private async completePaymentFlow(
    flow: PaymentFlow
  ): Promise<CompletedPaymentFlow> {
    log.info('Complete payment flow for payment flow ' + flow.id);

    // There is probably a nicer way to narrow the type and dispatch to the
    // correct provider, but this is straightforward and works for now
    if (flow.method === PaymentMethod.GoCardlessDirectDebit) {
      return gcFlowProvider.completePaymentFlow({
        ...flow,
        method: flow.method,
      });
    } else {
      return stripeFlowProvider.completePaymentFlow(flow);
    }
  }

  /**
   * Fetch data from the provider for the completed payment flow. This is used
   * to fetch additional information filled in by the user such as billing
   * address or name.
   *
   * @param completedPaymentFlow  The completed payment flow
   * @returns The completed payment flow data
   */
  private async getCompletedPaymentFlowData(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<CompletedPaymentFlowData> {
    // There is probably a nicer way to narrow the type and dispatch to the
    // correct provider, but this is straightforward and works for now
    if (
      completedPaymentFlow.flow.method === PaymentMethod.GoCardlessDirectDebit
    ) {
      return gcFlowProvider.getCompletedPaymentFlowData(completedPaymentFlow);
    } else {
      return stripeFlowProvider.getCompletedPaymentFlowData(
        completedPaymentFlow as CompletedPaymentFlow<PaymentMethod.StripeCard>
      );
    }
  }
}

export const paymentFlowService = new PaymentFlowService();
export default paymentFlowService;
