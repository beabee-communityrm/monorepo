import { runApp } from "@beabee/core/server";
import { optionsService } from "@beabee/core/services/OptionsService";
import type { SetupSupportEmailArgs } from "../../types/setup.js";

/**
 * Set up the support email based on the provided email domain
 */
export const setupSupportEmail = async (
  argv: SetupSupportEmailArgs
): Promise<void> => {
  await runApp(async () => {
    const supportEmail = `support@${argv.emailDomain}`;

    // Set support email based on email domain
    await optionsService.set("support-email", supportEmail);

    console.log("Support email configuration updated successfully!");
    console.log(`Support email set to: ${supportEmail}`);
  });
};
