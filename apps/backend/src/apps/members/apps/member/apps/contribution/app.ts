import { ContributionPeriod, ContributionType } from "@beabee/beabee-common";
import express from "express";

import { wrapAsync } from "@beabee/core/utils/index";
import { calcMonthsLeft } from "@core/utils/payment";

import PaymentService from "@beabee/core/services/PaymentService";
import ContactsService from "@beabee/core/services/ContactsService";

import { Contact } from "@beabee/core/models";

const app = express();

app.set("views", __dirname + "/views");

app.get(
  "/",
  wrapAsync(async (req, res) => {
    const contact = req.model as Contact;
    if (contact.contributionType === ContributionType.Automatic) {
      const payments = await PaymentService.getPayments(contact);

      const successfulPayments = payments
        .filter((p) => p.isSuccessful)
        .map((p) => p.amount - (p.amountRefunded || 0))
        .filter((amount) => !isNaN(amount));

      const total = successfulPayments.reduce((a, b) => a + b, 0);

      res.render("automatic", {
        member: contact,
        canChange: true, // TODO: remove
        monthsLeft: calcMonthsLeft(contact),
        payments,
        total
      });
    } else if (
      contact.contributionType === ContributionType.Manual ||
      contact.contributionType === ContributionType.None
    ) {
      res.render("manual", { member: contact });
    } else {
      res.render("none", { member: contact });
    }
  })
);

app.post(
  "/",
  wrapAsync(async (req, res) => {
    const contact = req.model as Contact;

    switch (req.body.action) {
      case "update-subscription":
        await ContactsService.updateContactContribution(contact, {
          monthlyAmount: Number(req.body.amount),
          period: req.body.period,
          prorate: req.body.prorate === "true",
          payFee: req.body.payFee === "true"
        });
        req.flash("success", "contribution-updated");
        break;

      case "cancel-subscription":
        await ContactsService.cancelContactContribution(
          contact,
          "cancelled-contribution"
        );
        break;

      case "update-manual-subscription":
        await PaymentService.updatePaymentMethod(contact, {
          paymentMethod: req.body.method,
          mandateId: req.body.source || "",
          customerId: req.body.reference || ""
        });

        await ContactsService.updateContactContribution(contact, {
          monthlyAmount:
            req.body.amount /
            (req.body.period === ContributionPeriod.Annually ? 12 : 1),
          period: req.body.period,
          prorate: false,
          payFee: false
        });

        req.flash("success", "contribution-updated");
        break;
    }

    res.redirect(req.originalUrl);
  })
);

export default app;
