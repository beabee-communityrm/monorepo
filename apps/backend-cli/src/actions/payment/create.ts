import { runApp } from "@beabee/core/server";
import { Contact, JoinForm } from "@beabee/core/models";
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

const completeUrl = config.audience + "/join/complete";
const completeUrls = {
  confirmUrl: config.audience + "/join/confirm-email",
  loginUrl: config.audience + "/auth/login",
  setPasswordUrl: config.audience + "/auth/set-password"
};

export const createPayment = async (argv: CreatePaymentArgs): Promise<void> => {
  await runApp(async () => {
    // Only support Stripe payment methods for now
    if (!argv.method.startsWith("s_")) {
      console.error("Only Stripe payment methods are currently supported");
      process.exit(1);
    }

    const existingContact = await contactsService.findOneBy({
      email: argv.email
    });

    let contact: Contact;
    if (existingContact) {
      contact = existingContact;
      console.log(`Using existing contact with email ${argv.email}`);
    } else {
      contact = await contactsService.createContact({
        email: argv.email,
        firstname: `Test_${argv.method}`,
        lastname: "User",
        password: await generatePassword("testpass123")
      });
      console.log(`Created new contact with email ${argv.email}`);
    }

    // Create initial contribution
    await paymentService.createContact(contact);
    const contribution = await paymentService.getContribution(contact);

    if (!contribution.customerId) {
      throw new Error("Customer ID is required");
    }

    const joinForm: JoinForm = {
      email: contact.email,
      password: contact.password,
      monthlyAmount: argv.amount,
      period: argv.period,
      payFee: argv.payFee,
      prorate: argv.prorate,
      paymentMethod: argv.method
    };

    // TODO: Add support for other payment methods
    if (argv.method !== PaymentMethod.StripeCard) {
      throw new Error("Only Stripe card is currently supported");
    }

    try {
      // Create join flow first
      const joinFlow = await paymentFlowService.createJoinFlow(
        joinForm,
        completeUrls
      );

      // Create Payment Method using test token
      const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
          token: "tok_visa"
        }
      });

      // Create payment flow with setup intent
      const paymentFlow = await paymentFlowService.createPaymentFlow(
        joinFlow,
        completeUrl,
        {
          email: contact.email,
          firstname: contact.firstname,
          lastname: contact.lastname
        }
      );

      // Confirm the setup intent with the payment method
      await stripe.setupIntents.confirm(paymentFlow.id, {
        payment_method: paymentMethod.id
      });

      // Create a test invoice for the payment
      const invoice = await stripe.invoices.create({
        customer: contribution.customerId,
        collection_method: "charge_automatically",
        auto_advance: true
      });

      // Add invoice item
      await stripe.invoiceItems.create({
        customer: contribution.customerId,
        amount: joinForm.monthlyAmount,
        currency: invoice.currency,
        invoice: invoice.id,
        description: "Initial payment"
      });

      // Finalize and pay invoice
      await stripe.invoices.pay(invoice.id);

      // Complete the flow
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
      console.log(`Invoice ID: ${invoice.id}`);
    } catch (error) {
      console.error("Failed to setup payment:", error);
      process.exit(1);
    }
  });
};
