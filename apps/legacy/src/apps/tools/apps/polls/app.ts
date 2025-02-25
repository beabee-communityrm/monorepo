import express, { type Express, type Request, type Response } from "express";
import moment from "moment";

import { createQueryBuilder, getRepository } from "@beabee/core/database";
import { hasNewModel, isAdmin } from "#core/middleware";
import { wrapAsync } from "@beabee/core/utils/async";

import { Callout, CalloutResponse } from "@beabee/core/models";

const app: Express = express();

app.set("views", __dirname + "/views");

app.use(isAdmin);

app.get(
  "/",
  wrapAsync(async (req: Request, res: Response) => {
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
  wrapAsync(async (req: Request, res: Response) => {
    const poll = req.model as Callout;
    const responsesCount = await getRepository(CalloutResponse).count({
      where: { calloutId: poll.id }
    });
    res.render("poll", { poll, responsesCount });
  })
);

app.post(
  "/:slug",
  hasNewModel(Callout, "slug"),
  wrapAsync(async (req: Request, res: Response) => {
    const callout = req.model as Callout;

    switch (req.body.action) {
      case "update":
        await getRepository(Callout).update(callout.id, {
          pollMergeField: req.body.pollMergeField,
          mcMergeField: req.body.mcMergeField
        });
        req.flash("success", "polls-updated");
        res.redirect(req.originalUrl);
        break;

      case "delete-responses":
        await getRepository(CalloutResponse).delete({
          calloutId: callout.id
        });
        req.flash("success", "polls-responses-deleted");
        res.redirect("/tools/polls/" + callout.slug);
        break;
    }
  })
);

export default app;
