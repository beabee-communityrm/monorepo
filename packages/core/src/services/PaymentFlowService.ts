import {
  PaymentFlowAdvanceParams,
  PaymentFlowSetupParams,
  PaymentFlowSetupResult,
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
} from '#type/index';

const log = mainLogger.child({ app: 'payment-flow-service' });

const flowProviders = {
  [PaymentMethod.GoCardlessDirectDebit]: gcFlowProvider,
  [PaymentMethod.StripeBACS]: stripeFlowProvider,
  [PaymentMethod.StripeCard]: stripeFlowProvider,
  [PaymentMethod.StripeIdeal]: stripeFlowProvider,
  [PaymentMethod.StripePayPal]: stripeFlowProvider,
  [PaymentMethod.StripeSEPA]: stripeFlowProvider,
} as const;

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
  ): Promise<PaymentFlowSetupResult> {
    const flow = await getRepository(PaymentFlow).save({
      form,
      method: params.paymentMethod,
      providerFlowId: '',
    });

    log.info('Creating payment registration flow ' + flow.id, { form });

    const providerResult = await flowProviders[flow.method].setupPaymentFlow(
      flow,
      params
    );
    await getRepository(PaymentFlow).update(flow.id, {
      providerFlowId: providerResult.id,
    });

    return {
      id: flow.id,
      ...(providerResult.redirectUrl && {
        redirectUrl: providerResult.redirectUrl,
      }),
    };
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

    log.info('Advanced payment flow ' + flowId, { params });
  }

  /**
   * Completes a payment flow after payment provider confirms the
   * new payment method is set up, updating the contact's payment details.
   *
   * @param contact - The contact
   * @param flowId - The ID of the payment flow to complete
   */
  async completePaymentFlowAndProcess(
    contact: Contact,
    flowId: string,
    params?: PaymentFlowAdvanceParams
  ): Promise<void> {
    const flow = await getRepository(PaymentFlow).findOneBy({
      id: flowId,
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
      log.info(`Not completing payment flow ${flow.id}, already processing`);
      return;
    }

    if (params) {
      await this.advancePaymentFlow(flowId, params);
      flow.params = params;
    }

    log.info('Complete payment flow and process for payment flow ' + flow.id);
    const completedPaymentFlow =
      await flowProviders[flow.method].completePaymentFlow(flow);

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

    log.info('Complete payment flow and get data for payment flow ' + flow.id);
    const flowProvider = flowProviders[flow.method];
    const completedPaymentFlow = await flowProvider.completePaymentFlow(flow);

    const data =
      await flowProvider.getCompletedPaymentFlowData(completedPaymentFlow);

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
    const canChange = await PaymentService.canProcessPaymentFlow(
      contact,
      completedFlow.flow.form
    );
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
}

export const paymentFlowService = new PaymentFlowService();
export default paymentFlowService;
