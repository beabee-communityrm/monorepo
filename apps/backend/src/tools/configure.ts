import { checkbox, input } from "@inquirer/prompts";

import { database, optionsService } from "@beabee/core";
import { runApp } from "#express";

import { Content } from "@beabee/models";

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

  await optionsService.set("support-email", "support@" + answers.emailDomain);

  await database.getRepository(Content).update("join", {
    data: () =>
      `jsonb_set(data, \'{paymentMethods}\', \'${JSON.stringify(
        answers.paymentProviders
      )}\')`
  });
});
