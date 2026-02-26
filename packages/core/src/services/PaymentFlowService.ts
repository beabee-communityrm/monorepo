import {
  PaymentFlowParams,
  PaymentFlowResult,
  PaymentMethod,
} from '@beabee/beabee-common';

import { getRepository } from '#database';
import { CantUpdateContribution } from '#errors/index';
import { log as mainLogger } from '#logging';
import { Contact, PaymentFlow } from '#models/index';
import {
  gcFlowProvider,
  stripeFlowProvider,
} from '#providers/payment-flow/index';
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
 * Service that manages payment flow processes in beabee.
 * Coordinates between different payment providers and handles payment method setup.
 *
 * The flow typically consists of these steps:
 * 1. Payment flow creation
 * 2. Provider-specific setup (Stripe/GoCardless)
 * 3. Payment completion
 * 4. Payment actions execution
 */
class PaymentFlowService {
  /**
   * Starts a payment registration flow with contribution details
   * @param form - Complete payment form with payment details
   * @param urls - Navigation URLs
   * @param params - Parameters for the payment flow
   * @returns The payment flow result for the client
   */
  async startPaymentFlow(
    form: PaymentFlowForm,
    params: PaymentFlowParams
  ): Promise<{ paymentFlowEntityId: string; result: PaymentFlowResult }> {
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
    return { paymentFlowEntityId: flow.id, result: setup.result };
  }

  /**
   * Completes a payment flow and returns additional contact data from the provider
   * @param paymentFlow - The payment flow entity to complete
   * @returns Payment flow data and additional contact information
   */
  async completePaymentFlowAndGetData(
    paymentFlow: PaymentFlow
  ): Promise<CompletedPaymentFlowData> {
    const completedPaymentFlow = await this.completePaymentFlow(paymentFlow);
    return await this.getCompletedPaymentFlowData(completedPaymentFlow);
  }

  /**
   * Executes payment actions for a completed payment flow and cleans up
   * @param contact - The contact to execute payment actions for
   * @param paymentFlow - The payment flow entity
   */
  async executeAndCleanupPaymentFlow(
    contact: Contact,
    paymentFlow: PaymentFlow
  ): Promise<void> {
    const completedPaymentFlow = await this.completePaymentFlow(paymentFlow);

    await this.executePaymentActions(contact, completedPaymentFlow);

    await getRepository(PaymentFlow).delete(paymentFlow.id);
  }

  /**
   * Starts a payment flow for existing contacts to change their payment method
   * and/or contribution details (amount, period, etc.).
   *
   * @param contact - The contact updating their contribution
   * @param form - Payment form data
   * @param params - Payment flow parameters
   * @returns The payment flow result
   */
  async startContactPaymentFlow(
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

    const paymentFlowSetup = await this.startPaymentFlow(form, params);

    return paymentFlowSetup.result;
  }

  /**
   * Finalizes a contribution update flow after payment provider confirms the
   * new payment method is set up, updating the contact's payment details.
   *
   * @param contact - The contact whose contribution is being updated
   * @param paymentFlowId - The ID of the payment flow to finalize
   * @returns True if the contribution update was finalized, false otherwise
   */
  async finalizePaymentFlow(
    contact: Contact,
    paymentFlowId: string
  ): Promise<boolean> {
    const flow = await getRepository(PaymentFlow).findOneBy({
      paymentFlowId,
    });
    if (flow) {
      const completedFlow = await this.completePaymentFlow(flow);
      if (completedFlow) {
        await this.executePaymentActions(contact, completedFlow);
        await getRepository(PaymentFlow).delete(flow.id);
        return true;
      }
    }

    return false;
  }

  /**
   * Permanently deletes all payment flows associated with a contact
   *
   * @param contact The contact
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    // Delete any payment flows associated with this contact
    await getRepository(PaymentFlow).delete({ contactId: contact.id });
  }

  /**
   * Executes the actual payment actions after a payment flow is completed.
   * For recurring contributions: updates payment method and contribution details.
   * For one-time payments: processes the payment and sends confirmation.
   *
   * @param contact - The contact receiving the payment actions
   * @param completedFlow - The completed payment flow data
   */
  private async executePaymentActions(
    contact: Contact,
    completedFlow: CompletedPaymentFlow
  ): Promise<void> {
    const form = completedFlow.form;
    // if (hasPaymentFormData(form) && isContributionPaymentFormStrict(form)) {
    //   const canChange = await PaymentService.canChangeContribution(
    //     contact,
    //     false,
    //     form
    //   );

    //   if (!canChange) {
    //     throw new CantUpdateContribution();
    //   }

    //   await PaymentService.updatePaymentMethod(contact, completedFlow);
    //   if (form.monthlyAmount > 0) {
    //     await ContactsService.updateContactContribution(contact, form);
    //   }
    // } else {
    //   await PaymentService.createOneTimePayment(contact, completedFlow);
    // }
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
      flow as any
    ); // TODO
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
      flow as any
    ); // TODO
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
    ].getCompletedPaymentFlowData(completedPaymentFlow as any); // TODO
  }
}

export const paymentFlowService = new PaymentFlowService();
export default paymentFlowService;
