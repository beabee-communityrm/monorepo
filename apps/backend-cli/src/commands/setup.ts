import type { CommandModule } from "yargs";
import type { ArgumentsCamelCase } from "yargs";
import type {
  SetupSupportEmailArgs,
  SetupPaymentMethodsArgs
} from "../types/setup.js";

export const setupCommand: CommandModule = {
  command: "setup <action>",
  describe: "Configure system settings",
  builder: (yargs) => {
    return yargs
      .command({
        command: "support-email",
        describe: "Set up support email configuration",
        builder: (yargs) => {
          return yargs.option("emailDomain", {
            alias: "e",
            type: "string",
            describe: "Email domain for support email",
            demandOption: true
          });
        },
        handler: async (argv: ArgumentsCamelCase<SetupSupportEmailArgs>) => {
          const { setupSupportEmail } = await import(
            "../actions/setup/support-email.js"
          );
          return setupSupportEmail(argv);
        }
      })
      .command({
        command: "payment-methods",
        describe: "Set up payment methods configuration",
        builder: (yargs) => {
          return yargs.option("paymentMethods", {
            alias: "p",
            type: "array",
            describe: "List of payment methods to enable",
            choices: [
              "s_card",
              "s_sepa",
              "s_bacs",
              "s_paypal",
              "gc_direct-debit"
            ],
            default: [
              "s_card",
              "s_sepa",
              "s_bacs",
              "s_paypal",
              "gc_direct-debit"
            ]
          });
        },
        handler: async (argv: ArgumentsCamelCase<SetupPaymentMethodsArgs>) => {
          const { setupPaymentMethods } = await import(
            "../actions/setup/payment-methods.js"
          );
          return setupPaymentMethods(argv);
        }
      });
  },
  handler: () => {}
};
