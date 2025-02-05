import { stripe, paymentMethodToStripeType, Stripe } from "#lib/stripe";
import { log as mainLogger } from "#logging";
import { JoinFlow } from "#models/index";

import { PaymentFlowProvider } from "./PaymentFlowProvider";

import {
  CompletedPaymentFlow,
  CompletedPaymentFlowData,
  PaymentFlow
} from "#type/index";
import { PaymentMethod } from "@beabee/beabee-common";
import { BadRequestError } from "#errors/BadRequestError";

const log = mainLogger.child({ app: "stripe-payment-flow-provider" });

class StripeFlowProvider implements PaymentFlowProvider {
  async createPaymentFlow(joinFlow: JoinFlow): Promise<PaymentFlow> {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: [
        paymentMethodToStripeType(joinFlow.joinForm.paymentMethod)
      ]
    });

    log.info("Created setup intent " + setupIntent.id);

    return {
      id: setupIntent.id,
      params: {
        clientSecret: setupIntent.client_secret as string
      }
    };
  }

  async completePaymentFlow(joinFlow: JoinFlow): Promise<CompletedPaymentFlow> {
    const setupIntent = await stripe.setupIntents.retrieve(
      joinFlow.paymentFlowId,
      { expand: ["latest_attempt"] }
    );
    let paymentMethod = joinFlow.joinForm.paymentMethod;
    let siPaymentMethodId: string | null;

    log.info("Fetched setup intent " + setupIntent.id);

    // iDEAL is a one time payment method, use setup intent to retrieve the SEPA
    // debit payment method instead
    // https://docs.stripe.com/payments/ideal/set-up-payment
    if (paymentMethod === PaymentMethod.StripeIdeal) {
      const latestAttempt =
        setupIntent.latest_attempt as Stripe.SetupAttempt | null;

      paymentMethod = PaymentMethod.StripeSEPA;
      siPaymentMethodId = latestAttempt?.payment_method_details.ideal
        ?.generated_sepa_debit as string | null;
    } else {
      siPaymentMethodId = setupIntent.payment_method as string | null;
    }

    if (!siPaymentMethodId) {
      log.error("No valid payment setup intent payment method", {
        joinFlow,
        setupIntent
      });
      throw new BadRequestError({ message: "Failed to complete payment flow" });
    }

    return {
      joinForm: { ...joinFlow.joinForm, paymentMethod },
      customerId: "", // Not needed
      mandateId: siPaymentMethodId
    };
  }

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
          line1: address.line1 || "",
          line2: address.line2 || undefined,
          city: address.city || "",
          postcode: address.postal_code || ""
        }
      })
    };
  }
}

export const stripeFlowProvider = new StripeFlowProvider();
/** @deprecated Use stripeFlowProvider instead */
export default stripeFlowProvider;
