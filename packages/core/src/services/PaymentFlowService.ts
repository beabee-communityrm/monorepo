import {
  PaymentFlowParams,
  PaymentFlowResult,
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

const paymentProviders = {
  [PaymentMethod.StripeCard]: stripeFlowProvider,
  [PaymentMethod.StripeSEPA]: stripeFlowProvider,
  [PaymentMethod.StripeBACS]: stripeFlowProvider,
  [PaymentMethod.StripePayPal]: stripeFlowProvider,
  [PaymentMethod.StripeIdeal]: stripeFlowProvider,
  [PaymentMethod.GoCardlessDirectDebit]: gcFlowProvider,
};

const log = mainLogger.child({ app: 'payment-flow-service' });

/**
 * Service that manages the complete payment flow process in beabee.
 * Coordinates between different payment providers and handles the setup of new payment methods.
 */
class PaymentFlowService {
  /**
   * Starts a payment flow with contribution details
   * @param form - Complete payment flow form with payment details
   * @param completeUrl - Provider-specific completion URL
   * @param data - User data for the flow
   * @returns Promise resolving to payment flow parameters
   */
  async startPaymentFlow(
    form: PaymentFlowForm,
    params: PaymentFlowParams
  ): Promise<{ flow: PaymentFlow; result: PaymentFlowResult }> {
    const flow = await getRepository(PaymentFlow).save({
      form,
      params,
      paymentFlowId: '',
    });

    log.info('Creating payment registration flow ' + flow.id, { form });

    const setup = await this.setupPaymentFlow(flow);
    await getRepository(PaymentFlow).update(flow.id, {
      paymentFlowId: setup.id,
    });

    return { flow, result: setup.result };
  }

  /**
   * Starts a payment flow for existing contacts to change their payment method
   * and/or contribution details (amount, period, etc.).
   *
   * @param contact - The contact updating their contribution
   * @param form - Form data for contribution changes
   * @param completeUrl - URL to redirect to after payment setup
   * @returns The payment flow parameters
   */
  async startPaymentFlowForContact(
    contact: Contact,
    form: PaymentFlowForm,
    params: PaymentFlowParams
  ): Promise<PaymentFlowResult> {
    if (
      form.action !== 'create-one-time-payment' &&
      !(await PaymentService.canProcessPaymentFlow(contact, form))
    ) {
      throw new CantUpdateContribution();
    }

    const ret = await this.startPaymentFlow(form, params);
    return ret.result;
  }

  /**
   * Finalizes a payment flow after payment provider confirms the
   * new payment method is set up, updating the contact's payment details.
   *
   * @param contact - The contact
   * @param paymentFlowId - The ID of the payment flow to finalize
   */
  async finalizePaymentFlow(
    contact: Contact,
    paymentFlowId: string
  ): Promise<void> {
    const flow = await getRepository(PaymentFlow).findOneBy({
      paymentFlowId,
    });
    if (!flow) {
      throw new NotFoundError();
    }

    const completedPaymentFlow = await this.completePaymentFlow(flow);
    await this.executePaymentActions(contact, completedPaymentFlow);
    // await this.executeAndCleanupPaymentFlow(contact, flow);
  }

  /**
   * Completes a payment flow and returns additional contact data from the provider
   * @param paymentFlow - The payment flow entity to complete
   * @returns Payment flow data and additional contact information
   */
  async completePaymentFlowAndGetData(paymentFlow: PaymentFlow): Promise<{
    flow: CompletedPaymentFlow;
    data: CompletedPaymentFlowData;
  }> {
    const completedPaymentFlow = await this.completePaymentFlow(paymentFlow);
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
  async executePaymentActions(
    contact: Contact,
    completedFlow: CompletedPaymentFlow
  ): Promise<void> {
    const form = completedFlow.form;

    const canChange = await PaymentService.canProcessPaymentFlow(contact, form);
    if (!canChange) {
      throw new CantUpdateContribution();
    }

    if (form.action === 'create-one-time-payment') {
      await PaymentService.createOneTimePayment(contact, completedFlow);
    } else {
      await PaymentService.updatePaymentMethod(contact, completedFlow);
      if (form.action === 'start-contribution') {
        await ContactsService.updateContactContribution(contact, {
          ...form,
          prorate: false,
        });
      }
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
  private async setupPaymentFlow(flow: PaymentFlow): Promise<PaymentFlowSetup> {
    log.info('Create payment flow for payment flow ' + flow.id);
    return paymentProviders[flow.params.paymentMethod].setupPaymentFlow(
      flow as any // TODO: fix type
    );
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
    return paymentProviders[flow.params.paymentMethod].completePaymentFlow(
      flow as any // TODO: fix type
    );
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
    return paymentProviders[
      completedPaymentFlow.params.paymentMethod
    ].getCompletedPaymentFlowData(
      completedPaymentFlow as any // TODO: fix type
    );
  }
}

export const paymentFlowService = new PaymentFlowService();
export default paymentFlowService;
