import { runApp } from "@beabee/core/server";
import { Contact, Payment } from "@beabee/core/models";
import { getRepository } from "@beabee/core/database";
import { PaymentStatus } from "@beabee/beabee-common";

export const listPayments = async (email?: string): Promise<void> => {
  await runApp(async () => {
    const queryBuilder = getRepository(Payment)
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.contact", "contact")
      .orderBy("payment.chargeDate", "DESC");

    if (email) {
      queryBuilder.where("contact.email = :email", { email });
    }

    const payments = await queryBuilder.getMany();

    if (payments.length === 0) {
      console.log(
        email ? `No payments found for ${email}` : "No payments found"
      );
      return;
    }

    console.log("\nPayments:");
    console.log("--------------------------------------------------");
    for (const payment of payments) {
      console.log(`ID: ${payment.id}`);
      console.log(`Amount: €${payment.amount}`);
      console.log(`Status: ${payment.status}`);
      console.log(`Charge Date: ${payment.chargeDate.toISOString()}`);
      if (payment.contact) {
        console.log(
          `Contact: ${payment.contact.firstname} ${payment.contact.lastname} (${payment.contact.email})`
        );
      }
      if (payment.description) {
        console.log(`Description: ${payment.description}`);
      }
      if (payment.amountRefunded) {
        console.log(`Refunded: €${payment.amountRefunded}`);
      }
      console.log("--------------------------------------------------");
    }
  });
};
