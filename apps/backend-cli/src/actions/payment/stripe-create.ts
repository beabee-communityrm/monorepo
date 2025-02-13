import Stripe from "stripe";
import { Contact } from "@beabee/core/models";
import { paymentService } from "@beabee/core/services";
import { PaymentForm, PaymentMethod } from "@beabee/beabee-common";
import type { CreatePaymentArgs } from "../../types/index.js";
import {
  stripe,
  getPriceData,
  getSalesTaxRateObject
} from "@beabee/core/lib/stripe";

// Step 2: Create join flow data
function createPaymentFormData(argv: CreatePaymentArgs): PaymentForm {
  return {
    monthlyAmount: argv.amount,
    period: argv.period,
    payFee: argv.payFee,
    prorate: argv.prorate
  };
}

// Step 3: Create payment flow with SetupIntent
async function createStripeCustomer(
  contact: Contact
): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email: contact.email,
    name: `${contact.firstname} ${contact.lastname}`,
    metadata: {
      contactId: contact.id
    }
  });
}

// Step 4: Simulate Stripe Elements setup
async function setupTestPaymentMethod(
  customerId: string
): Promise<Stripe.PaymentMethod> {
  // Create payment method with test card
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: { token: "tok_visa" }
  });

  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethod.id, {
    customer: customerId
  });

  // Set as default payment method
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethod.id
    }
  });

  return paymentMethod;
}

// Step 5 & 6: Complete payment flow and create initial invoice
async function createAndActivateSubscription(
  customerId: string,
  paymentForm: PaymentForm,
  paymentMethod: PaymentMethod
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price_data: getPriceData(paymentForm, paymentMethod) }],
    payment_behavior: "error_if_incomplete",
    expand: ["latest_invoice.payment_intent"],
    default_tax_rates: getSalesTaxRateObject()
  });

  // Ensure subscription is active
  if (subscription.status !== "active") {
    await stripe.subscriptions.update(subscription.id, {
      trial_end: "now"
    });
  }

  return subscription;
}

/**
 * Creates a test payment by simulating the complete payment flow that would normally
 * happen in the browser. Currently only supports Stripe card payments.
 *
 * Flow:
 * 1. Create/Get contact (passed as parameter)
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
  try {
    // Step 2: Create join flow data
    const paymentForm = createPaymentFormData(argv);

    // Step 3: Create payment flow with SetupIntent
    const customer = await createStripeCustomer(contact);

    // Step 4: Simulate Stripe Elements setup
    const paymentMethod = await setupTestPaymentMethod(customer.id);

    // Step 5 & 6: Complete payment flow and create initial invoice
    const subscription = await createAndActivateSubscription(
      customer.id,
      paymentForm,
      PaymentMethod.StripeCard
    );

    // Update contact with payment data
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
