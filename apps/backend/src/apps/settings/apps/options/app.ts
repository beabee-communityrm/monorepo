import express from "express";

import { isSuperAdmin } from "#express";
import { wrapAsync, optionsService } from "@beabee/core";

const app = express();

app.set("views", __dirname + "/views");

app.use(isSuperAdmin);

app.get("/", function (req, res) {
  const options = optionsService.getAll();
  res.render("index", { options, showHidden: req.query.hidden !== undefined });
});

app.get("/:key/edit", function (req, res) {
  if (optionsService.isKey(req.params.key)) {
    const option = optionsService.get(req.params.key);
    res.locals.breadcrumb.push({
      name: option.key
    });

    req.flash("warning", "option-404");
    res.render("edit", { option });
  } else {
    res.redirect("/settings/options");
  }
});

app.post(
  "/:key/edit",
  wrapAsync(async function (req, res) {
    if (optionsService.isKey(req.params.key)) {
      await optionsService.set(req.params.key, req.body.value || "");
      req.flash("success", "option-updated");
    }
    res.redirect("/settings/options");
  })
);

app.get("/:key/reset", function (req, res) {
  if (optionsService.isKey(req.params.key)) {
    const option = optionsService.get(req.params.key);
    res.locals.breadcrumb.push({
      name: option.key
    });

    res.render("reset", { key: option.key });
  } else {
    req.flash("warning", "option-404");
    res.redirect("/settings/options");
  }
});

app.post(
  "/:key/reset",
  wrapAsync(async function (req, res) {
    if (optionsService.isKey(req.params.key)) {
      await optionsService.reset(req.params.key);
      req.flash("success", "option-reset");
    }
    res.redirect("/settings/options");
  })
);

export default app;
