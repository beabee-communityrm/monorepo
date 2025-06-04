import type { CommandModule } from "yargs";
import type { ArgumentsCamelCase } from "yargs";
import type {
  SetupSupportEmailArgs,
  SetupPaymentMethodsArgs,
  SetupAdminArgs,
  SetupAllArgs
} from "../types/setup.js";

export const setupCommand: CommandModule = {
  command: "setup <action>",
  describe: "Configure system settings",
  builder: (yargs) => {
    return yargs
      .command({
        command: "support-email",
        describe: "Set up support email configuration",
        builder: (yargs: any) => {
          return yargs.option("emailDomain", {
            alias: "e",
            type: "string",
            describe: "Email domain for support email"
          });
        },
        handler: async (argv: any) => {
          const { setupSupportEmail } = await import(
            "../actions/setup/support-email.js"
          );
          return setupSupportEmail(argv);
        }
      })
      .command({
        command: "payment-methods",
        describe: "Set up payment methods configuration",
        builder: (yargs: any) => {
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
            ]
          });
        },
        handler: async (argv: any) => {
          const { setupPaymentMethods } = await import(
            "../actions/setup/payment-methods.js"
          );
          return setupPaymentMethods(argv);
        }
      })
      .command({
        command: "admin",
        describe: "Set up initial admin user",
        builder: (yargs: any) => {
          return yargs
            .option("firstname", {
              alias: "f",
              type: "string",
              describe: "First name of the admin user"
            })
            .option("lastname", {
              alias: "l",
              type: "string",
              describe: "Last name of the admin user"
            })
            .option("email", {
              alias: "e",
              type: "string",
              describe: "Email address of the admin user"
            })
            .option("password", {
              alias: "p",
              type: "string",
              describe:
                "Password for the admin user (leave empty to generate reset link)"
            });
        },
        handler: async (argv: any) => {
          const { setupAdmin } = await import("../actions/setup/admin.js");
          return setupAdmin(argv);
        }
      })
      .command({
        command: "all",
        describe: "Complete system setup (all steps in sequence)",
        builder: (yargs: any) => {
          return yargs
            .option("emailDomain", {
              alias: "e",
              type: "string",
              describe: "Email domain for support email"
            })
            .option("paymentMethods", {
              alias: "p",
              type: "array",
              describe: "List of payment methods to enable",
              choices: [
                "s_card",
                "s_sepa",
                "s_bacs",
                "s_paypal",
                "gc_direct-debit"
              ]
            })
            .option("firstname", {
              alias: "f",
              type: "string",
              describe: "First name of the admin user"
            })
            .option("lastname", {
              alias: "l",
              type: "string",
              describe: "Last name of the admin user"
            })
            .option("email", {
              alias: "admin-email",
              type: "string",
              describe: "Email address of the admin user"
            })
            .option("password", {
              alias: "admin-password",
              type: "string",
              describe:
                "Password for the admin user (leave empty to generate reset link)"
            });
        },
        handler: async (argv: any) => {
          const { setupAll } = await import("../actions/setup/all.js");
          return setupAll(argv);
        }
      });
  },
  handler: () => {}
};
