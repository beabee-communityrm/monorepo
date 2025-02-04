import "module-alias/register";

import { checkbox, input } from "@inquirer/prompts";

import { getRepository } from "@beabee/core/database";
import { runApp } from "@beabee/core/server";

import OptionsService from "@beabee/core/services/OptionsService";

import { Content } from "@beabee/core/models";

console.warn(
  "\n⚠️  DEPRECATED: This configure tool is deprecated and will be removed in the next major version.\n" +
  "Please use the new backend-cli configure command instead: yarn backend-cli configure\n"
);

function notEmpty(s: string) {
  return s.trim() !== "";
}

runApp(async () => {
  const answers = {
    emailDomain: await input({ message: "Email Domain", validate: notEmpty }),
    paymentProviders: await checkbox({
      message: "Payment Methods",
      choices: [
        { name: "Credit card (Stripe)", value: "s_card" },
        { name: "SEPA direct debit (Stripe)", value: "s_sepa" },
        { name: "BACS (Stripe)", value: "s_bacs" },
        { name: "PayPal (Stripe)", value: "s_paypal" },
        { name: "Direct debit (GoCardless)", value: "gc_direct-debit" }
      ]
    })
  };

  await OptionsService.set("support-email", "support@" + answers.emailDomain);

  await getRepository(Content).update("join", {
    data: () =>
      `jsonb_set(data, \'{paymentMethods}\', \'${JSON.stringify(
        answers.paymentProviders
      )}\')`
  });
});
