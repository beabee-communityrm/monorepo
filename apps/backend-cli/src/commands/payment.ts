import type { CommandModule } from "yargs";
import { createPaymentTestData } from "../actions/payment/create-test-data.js";
import { ContributionPeriod, PaymentMethod } from "@beabee/beabee-common";

export const paymentCommand: CommandModule = {
  command: "payment",
  describe: "Payment management commands",
  builder: (yargs) =>
    yargs.command({
      command: "create-test-data",
      describe: "Create test payment data",
      builder: (yargs) =>
        yargs
          .option("count", {
            alias: "c",
            type: "number",
            description: "Number of test payments to create",
            default: 1
          })
          .option("method", {
            alias: "m",
            type: "string",
            description: "Payment method",
            default: PaymentMethod.StripeCard,
            choices: Object.values(PaymentMethod)
          })
          .option("amount", {
            alias: "a",
            type: "number",
            description: "Monthly amount in cents",
            default: 1000
          })
          .option("period", {
            alias: "p",
            type: "string",
            description: "Contribution period",
            default: ContributionPeriod.Monthly,
            choices: Object.values(ContributionPeriod)
          })
          .option("payFee", {
            type: "boolean",
            description: "Pay processing fee",
            default: false
          })
          .option("prorate", {
            type: "boolean",
            description: "Prorate payment",
            default: false
          })
          .option("email", {
            alias: "e",
            type: "string",
            description:
              "Contact email (optional, will generate if not provided)"
          })
          .example(
            "$0 payment create-test-data --count 5 --method s_card --amount 2000 --period monthly --payFee --prorate",
            "Create 5 test payments with Stripe card payment method, 20€ monthly amount, processing fee and proration enabled"
          ),
      handler: async (argv) => {
        await createPaymentTestData({
          count: argv.count,
          method: argv.method,
          amount: argv.amount,
          period: argv.period,
          payFee: argv.payFee,
          prorate: argv.prorate,
          email: argv.email
        });
      }
    }),
  handler: () => {}
};
