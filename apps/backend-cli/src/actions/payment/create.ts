import { runApp } from "@beabee/core/server";
import { generatePassword } from "@beabee/core/utils/auth";
import { contactsService } from "@beabee/core/services";
import { PaymentMethod } from "@beabee/beabee-common";
import type { CreatePaymentArgs } from "../../types/index.js";
import { createStripePayment } from "./stripe-create.js";

export const createPayment = async (argv: CreatePaymentArgs): Promise<void> => {
  await runApp(async () => {
    try {
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

      // Handle different payment methods
      switch (argv.method) {
        case PaymentMethod.StripeCard:
          await createStripePayment(contact, argv);
          break;
        default:
          throw new Error(`Payment method ${argv.method} is currently not supported`);
      }
    } catch (error) {
      console.error("Failed to create payment:", error);
      process.exit(1);
    }
  });
};
