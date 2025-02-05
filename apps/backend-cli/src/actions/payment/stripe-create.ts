import { Contact } from "@beabee/core/models";
import { paymentService } from "@beabee/core/services";
import { PaymentForm, PaymentMethod } from "@beabee/beabee-common";
import { stripe, getPriceData } from "@beabee/core/lib/stripe";
import type { CreatePaymentArgs } from "../../types/index.js";

// TODO: check if we can use stripe.webhookEndpoints instead of the stripe cli: stripe listen --forward-to localhost:3003/stripe

/**
 * Creates a test payment by simulating the complete payment flow that would normally
 * happen in the browser. Currently only supports Stripe card payments.
 *
 * Flow:
 * 1. Create/Get contact
 * 2. Create join flow
 * 3. Create payment flow with SetupIntent
 * 4. Simulate Stripe Elements setup with test token
 * 5. Complete payment flow
 * 6. Create and pay initial invoice
 */
export async function createStripePayment(
  contact: Contact,
  argv: CreatePaymentArgs
): Promise<void> {
  console.log(
    `\nIMPORTANT: Make sure to run 'stripe listen --forward-to localhost:${process.env.WEBHOOK_PORT}/stripe' in parallel to receive webhooks locally\n`
  );

  try {
    // Create payment form data
    const paymentForm: PaymentForm = {
      monthlyAmount: argv.amount,
      period: argv.period,
      payFee: false,
      prorate: false
    };

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: contact.email,
      name: `${contact.firstname} ${contact.lastname}`,
      metadata: {
        contactId: contact.id
      }
    });

    // Create payment method with test card
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: { token: "tok_visa" }
    });

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id
      }
    });

    // Get price data using helper
    const priceData = getPriceData(paymentForm, PaymentMethod.StripeCard);

    // Create subscription with payment_behavior to trigger webhooks
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: priceData
        }
      ],
      payment_behavior: "default_incomplete",
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription"
      },
      expand: ["latest_invoice.payment_intent"]
    });

    // Update contact with Stripe data
    await paymentService.updateData(contact, {
      customerId: customer.id,
      mandateId: paymentMethod.id,
      subscriptionId: subscription.id
    });

    console.log("Payment setup completed successfully!");
    console.log(`Customer ID: ${customer.id}`);
    console.log(`Payment Method ID: ${paymentMethod.id}`);
    console.log(`Subscription ID: ${subscription.id}`);
  } catch (error) {
    console.error("Failed to setup payment:", error);
    throw error;
  }
}
