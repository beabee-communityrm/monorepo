import { runApp } from "@beabee/core/server";
import { Contact } from "@beabee/core/models";
import { generatePassword } from "@beabee/core/utils/auth";
import {
  paymentService,
  paymentFlowService,
  contactsService
} from "@beabee/core/services";
import { config } from "@beabee/core/config";
import { PaymentMethod } from "@beabee/beabee-common";
import type { CreatePaymentArgs } from "../../types/index.js";
import { stripe } from "@beabee/core/lib/stripe";

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
export const createPayment = async (argv: CreatePaymentArgs): Promise<void> => {
  await runApp(async () => {
    // Only support Stripe card payments for now
    if (argv.method !== PaymentMethod.StripeCard) {
      throw new Error("Only Stripe card payments are currently supported");
    }

    // Get or create contact
    let contact = await contactsService.findOneBy({ email: argv.email });
    if (!contact) {
      contact = await contactsService.createContact({
        email: argv.email,
        firstname: "Test",
        lastname: "User",
        password: await generatePassword("testpass123")
      });
      console.log(`Created new contact with email ${argv.email}`);
    } else {
      console.log(`Using existing contact with email ${argv.email}`);
    }

    // Create initial contribution
    await paymentService.createContact(contact);

    // Create join flow
    const joinForm = {
      email: contact.email,
      password: contact.password,
      monthlyAmount: argv.amount,
      period: argv.period,
      payFee: argv.payFee,
      prorate: argv.prorate,
      paymentMethod: argv.method
    };

    const completeUrls = {
      confirmUrl: config.audience + "/join/confirm-email",
      loginUrl: config.audience + "/auth/login",
      setPasswordUrl: config.audience + "/auth/set-password"
    };

    try {
      // Create join flow
      const joinFlow = await paymentFlowService.createJoinFlow(
        joinForm,
        completeUrls
      );

      // Create payment flow
      const paymentFlow = await paymentFlowService.createPaymentFlow(
        joinFlow,
        config.audience + "/join/complete",
        {
          email: contact.email,
          firstname: contact.firstname,
          lastname: contact.lastname
        }
      );

      // Simulate Stripe Elements setup with test card
      const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
          token: "tok_visa" // Test token that always succeeds
        }
      });

      // Confirm SetupIntent with payment method
      await stripe.setupIntents.confirm(paymentFlow.id, {
        payment_method: paymentMethod.id
      });

      // Complete the payment flow
      const completedFlow = await paymentFlowService.completePaymentFlow({
        ...joinFlow,
        paymentFlowId: paymentFlow.id
      });

      // Update payment method and contribution
      await paymentService.updatePaymentMethod(contact, completedFlow);
      await contactsService.updateContactContribution(contact, joinForm);

      console.log("Payment setup completed successfully!");
      console.log(`Payment Flow ID: ${paymentFlow.id}`);
      console.log(`Payment Method ID: ${paymentMethod.id}`);
    } catch (error) {
      console.error("Failed to setup payment:", error);
      process.exit(1);
    }
  });
};
