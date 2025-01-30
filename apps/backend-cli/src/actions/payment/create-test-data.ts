// apps/backend-cli/src/actions/payment/create-test-data.ts
import { runApp } from "@beabee/core/server";
import { Contact } from "@beabee/core/models";
import { getRepository } from "@beabee/core/database";
import {
  paymentService,
  paymentFlowService,
  contactsService
} from "@beabee/core/services";
import { generatePassword } from "@beabee/core/utils/auth";
import {
  ContributionPeriod,
  ContributionType,
  PaymentMethod
} from "@beabee/beabee-common";
import { CompleteUrls } from "@beabee/core/type";
import { config } from "@beabee/core/config";

interface CreatePaymentTestDataArgs {
  count: number;
  method: PaymentMethod;
  amount: number;
  period: ContributionPeriod;
  payFee: boolean;
  prorate: boolean;
  email?: string | undefined;
}

const completeUrl = config.audience + "/join/complete";

const completeUrls: CompleteUrls = {
  confirmUrl: config.audience + "/join/confirm-email",
  loginUrl: config.audience + "/auth/login",
  setPasswordUrl: config.audience + "/auth/set-password"
};

export const createPaymentTestData = async ({
  count,
  method,
  amount,
  period,
  payFee,
  prorate,
  email
}: CreatePaymentTestDataArgs) => {
  await runApp(async () => {
    console.log(`Creating ${count} test payments...`);

    for (let i = 0; i < count; i++) {
      let contact: Contact;

      let contactEmail = email || `test-payment-${method}-${i}@example.com`;

      const existingContact = await contactsService.findOneBy({
        email: contactEmail
      });
      if (existingContact) {
        contact = existingContact;
        console.log(`Using existing contact with email ${contactEmail}`);
      } else {
        contact = await getRepository(Contact).save({
          email: contactEmail,
          firstname: `Test_${method}_${i}`,
          lastname: "User"
        });
        console.log(`Created new contact with email ${contactEmail}`);
      }

      // Create payment join flow
      const paymentFlow = await paymentFlowService.createPaymentJoinFlow(
        {
          email: contact.email,
          password: await generatePassword("testpass123"),
          monthlyAmount: amount,
          period,
          payFee,
          prorate,
          paymentMethod: method
        },
        completeUrls,
        completeUrl,
        {
          email: contact.email,
          firstname: contact.firstname,
          lastname: contact.lastname
        }
      );

      console.log(`Created payment ${i + 1}/${count}`);
    }

    console.log("Done creating test payments");
  });
};
