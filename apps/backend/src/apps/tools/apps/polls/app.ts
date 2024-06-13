import express from "express";
import moment from "moment";
import { createQueryBuilder } from "typeorm";

import { database, wrapAsync } from "@beabee/core";
import { hasNewModel, isAdmin } from "#express";

import { Callout, CalloutResponse } from "@beabee/models";

const app = express();

app.set("views", __dirname + "/views");

app.use(isAdmin);

app.get(
  "/",
  wrapAsync(async (req, res) => {
    const polls = await createQueryBuilder(Callout, "p")
      .loadRelationCountAndMap("p.responseCount", "p.responses")
      .orderBy({ date: "DESC" })
      .getMany();

    res.render("index", { polls });
  })
);

app.get(
  "/:slug",
  hasNewModel(Callout, "slug"),
  wrapAsync(async (req, res) => {
    const poll = req.model as Callout;
    const responsesCount = await database.getRepository(CalloutResponse).count({
      where: { calloutId: poll.id }
    });
    res.render("poll", { poll, responsesCount });
  })
);

app.post(
  "/:slug",
  hasNewModel(Callout, "slug"),
  wrapAsync(async (req, res) => {
    const callout = req.model as Callout;

    switch (req.body.action) {
      case "update":
        await database.getRepository(Callout).update(callout.id, {
          pollMergeField: req.body.pollMergeField,
          mcMergeField: req.body.mcMergeField
        });
        req.flash("success", "polls-updated");
        res.redirect(req.originalUrl);
        break;

      case "delete-responses":
        await database.getRepository(CalloutResponse).delete({
          calloutId: callout.id
        });
        req.flash("success", "polls-responses-deleted");
        res.redirect("/tools/polls/" + callout.slug);
        break;
    }
  })
);

export default app;
