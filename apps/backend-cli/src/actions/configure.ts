import { runApp } from "@beabee/core/server";
import { getRepository } from "@beabee/core/database";
import { Content } from "@beabee/core/models";
import { optionsService } from "@beabee/core/services/OptionsService";
import type { ConfigureArgs } from "../types/index.js";

export const configure = async (argv: ConfigureArgs): Promise<void> => {
  await runApp(async () => {
    // Set support email based on email domain
    await optionsService.set("support-email", "support@" + argv.emailDomain);

    // Update payment methods in join content
    await getRepository(Content).update("join", {
      data: () =>
        `jsonb_set(data, '{paymentMethods}', '${JSON.stringify(
          argv.paymentMethods
        )}')`
    });

    console.log("System configuration updated successfully!");
    console.log(`Support email set to: support@${argv.emailDomain}`);
    console.log("Payment methods updated to:", argv.paymentMethods.join(", "));
  });
};
