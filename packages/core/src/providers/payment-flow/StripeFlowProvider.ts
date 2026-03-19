import { PaymentMethod, isContributionForm } from '@beabee/beabee-common';

import { BadRequestError } from '#errors/BadRequestError';
import { Stripe, paymentMethodToStripeType, stripe } from '#lib/stripe';
import { log as mainLogger } from '#logging';
import { JoinFlow } from '#models/index';
import {
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlow,
  PaymentFlowData,
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
   * @param joinFlow - Join flow containing payment method selection
   * @param _completeUrl - URL for setup completion (unused in Stripe flow)
   * @param _data - Additional setup data (unused in Stripe flow)
   * @returns Promise resolving to payment flow with SetupIntent details
   * @throws {BadRequestError} If payment method is not supported
   */
  async createPaymentFlow(
    joinFlow: JoinFlow,
    _completeUrl: string,
    _data: PaymentFlowData
  ): Promise<PaymentFlow> {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: [
        paymentMethodToStripeType(joinFlow.joinForm.paymentMethod),
      ],
    });

    log.info('Created setup intent ' + setupIntent.id);

    return {
      id: setupIntent.id,
      params: {
        clientSecret: setupIntent.client_secret as string,
      },
    };
  }

  /**
   * Completes a payment flow by retrieving and validating the SetupIntent
   * @param joinFlow - Join flow to complete
   * @returns Promise resolving to completed payment flow with payment method ID
   * @throws {BadRequestError} If SetupIntent status is not succeeded
   */
  async completePaymentFlow(joinFlow: JoinFlow): Promise<CompletedPaymentFlow> {
    const setupIntent = await stripe.setupIntents.retrieve(
      joinFlow.paymentFlowId,
      { expand: ['latest_attempt'] }
    );

    let paymentMethod = joinFlow.joinForm.paymentMethod;
    let mandateId: string | null;

    log.info('Fetched setup intent ' + setupIntent.id);

    // iDEAL is a one time payment method, use setup intent to retrieve the SEPA
    // debit payment method instead
    // https://docs.stripe.com/payments/ideal/set-up-payment
    if (
      paymentMethod === PaymentMethod.StripeIdeal &&
      isContributionForm(joinFlow.joinForm)
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
        joinFlow,
        setupIntent,
      });
      throw new BadRequestError({ message: 'Failed to complete payment flow' });
    }

    return {
      joinForm: { ...joinFlow.joinForm, paymentMethod },
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
