import express, { type Express, type Request, type Response } from "express";
import moment from "moment";
import { Between } from "typeorm";

import { getRepository } from "@beabee/core/database";
import { isSuperAdmin } from "#core/middleware";
import { wrapAsync } from "@beabee/core/utils/express";

import { Payment } from "@beabee/core/models";

const app: Express = express();

app.set("views", __dirname + "/views");

app.use(isSuperAdmin);

app.get(
  "/:year?/:month?",
  wrapAsync(async function (req: Request, res: Response) {
    const start = moment.utc().startOf("month");
    if (req.params.month && req.params.year) {
      start.set({
        month: Number(req.params.month) - 1,
        year: Number(req.params.year)
      });
    }

    if (start.isAfter()) {
      req.flash("warning", "transaction-date-in-future");
      res.redirect("/reports/transactions");
      return;
    }

    const end = start.clone().add(1, "month");
    const previous = start.clone().subtract(1, "month");

    const payments = await getRepository(Payment).find({
      where: {
        createdAt: Between(start.toDate(), end.toDate())
      },
      order: { chargeDate: "DESC" },
      relations: { contact: true }
    });

    const successfulPayments = payments
      .filter((p) => p.isSuccessful)
      .map((p) => p.amount - (p.amountRefunded || 0))
      .filter((amount) => !isNaN(amount));

    const total = successfulPayments.reduce((a, b) => a + b, 0).toFixed(2);

    res.render("index", {
      payments,
      total: total,
      next: end,
      previous: previous,
      start: start
    });
  })
);

export default app;
