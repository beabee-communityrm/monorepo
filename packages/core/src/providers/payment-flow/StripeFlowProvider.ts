import { PaymentMethod } from '@beabee/beabee-common';

import { BadRequestError } from '#errors/BadRequestError';
import { Stripe, paymentMethodToStripeType, stripe } from '#lib/stripe';
import { log as mainLogger } from '#logging';
import { PaymentFlow } from '#models/index';
import {
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlowData,
  PaymentFlowSetup,
} from '#type/index';

import { PaymentFlowProvider } from './PaymentFlowProvider';

const log = mainLogger.child({ app: 'stripe-payment-flow-provider' });

/**
 * Implements PaymentFlowProvider for Stripe payment methods.
 * Handles setup of card payments, SEPA Direct Debit, BACS, PayPal, and iDEAL.
 */
class StripeFlowProvider implements PaymentFlowProvider {
  /**
   * Creates a Stripe SetupIntent for payment method setup
   * @param flow - Payment flow containing payment method selection
   * @param _completeUrl - URL for setup completion (unused in Stripe flow)
   * @param _data - Additional setup data (unused in Stripe flow)
   * @returns Promise resolving to payment flow with SetupIntent details
   * @throws {BadRequestError} If payment method is not supported
   */
  async setupPaymentFlow(
    flow: PaymentFlow,
    _completeUrl: string,
    _data: PaymentFlowData
  ): Promise<PaymentFlowSetup> {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: [
        paymentMethodToStripeType(flow.form.paymentMethod),
      ],
    });

    log.info('Created setup intent ' + setupIntent.id);

    return {
      id: setupIntent.id,
      result: {
        clientSecret: setupIntent.client_secret as string,
      },
    };
  }

  /**
   * Completes a payment flow by retrieving and validating the SetupIntent
   * @param flow - Payment flow to complete
   * @returns Promise resolving to completed payment flow with payment method ID
   * @throws {BadRequestError} If SetupIntent status is not succeeded
   */
  async completePaymentFlow(flow: PaymentFlow): Promise<CompletedPaymentFlow> {
    const setupIntent = await stripe.setupIntents.retrieve(flow.paymentFlowId, {
      expand: ['latest_attempt'],
    });

    let paymentMethod = flow.form.paymentMethod;
    let mandateId: string | null;

    log.info('Fetched setup intent ' + setupIntent.id);

    // iDEAL is a one time payment method, use setup intent to retrieve the SEPA
    // debit payment method instead
    // https://docs.stripe.com/payments/ideal/set-up-payment
    if (
      paymentMethod === PaymentMethod.StripeIdeal &&
      flow.form.action === 'start-contribution'
    ) {
      const latestAttempt =
        setupIntent.latest_attempt as Stripe.SetupAttempt | null;

      paymentMethod = PaymentMethod.StripeSEPA;
      mandateId = latestAttempt?.payment_method_details.ideal
        ?.generated_sepa_debit as string | null;
    } else {
      mandateId = setupIntent.payment_method as string | null;
    }

    if (!mandateId) {
      log.error('Setup intent missing mandate or customer ID', {
        flow,
        setupIntent,
      });
      throw new BadRequestError({ message: 'Failed to complete payment flow' });
    }

    return {
      form: { ...flow.form, paymentMethod },
      customerId: '', // Unused in the Stripe flow
      mandateId,
    };
  }

  /**
   * Retrieves payment method details from a completed flow
   * @param completedPaymentFlow - The completed payment flow
   * @returns Promise resolving to payment flow data including billing details
   */
  async getCompletedPaymentFlowData(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<CompletedPaymentFlowData> {
    const paymentMethod = await stripe.paymentMethods.retrieve(
      completedPaymentFlow.mandateId
    );

    const address = paymentMethod.billing_details.address;
    return {
      // TODO: Remove after payment flow changes
      firstname: '',
      lastname: '',
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
