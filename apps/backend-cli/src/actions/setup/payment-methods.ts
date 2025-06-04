import { runApp } from "@beabee/core/server";
import { getRepository } from "@beabee/core/database";
import { Content } from "@beabee/core/models";
import type { SetupPaymentMethodsArgs } from "../../types/setup.js";

/**
 * Set up payment methods in the join content
 */
export const setupPaymentMethods = async (
  argv: SetupPaymentMethodsArgs
): Promise<void> => {
  await runApp(async () => {
    // Update payment methods in join content
    await getRepository(Content).update("join", {
      data: () =>
        `jsonb_set(data, '{paymentMethods}', '${JSON.stringify(
          argv.paymentMethods
        )}')`
    });

    console.log("Payment methods configuration updated successfully!");
    console.log("Payment methods updated to:", argv.paymentMethods.join(", "));
  });
};
