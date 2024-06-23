import express from "express";
import { optionsService } from "@beabee/core";
import { OptionKey } from "@beabee/config";

const app = express();

app.set("views", __dirname + "/views");

app.get("/", (req, res, next) => {
  const redirectUrlOpt: OptionKey = req.user
    ? req.user.hasRole("admin")
      ? "admin-home-url"
      : "user-home-url"
    : "home-redirect-url";

  const redirectUrl = optionsService.getText(redirectUrlOpt);
  if (redirectUrl) {
    res.redirect(redirectUrl);
  } else {
    next();
  }
});

app.get("/", function (req, res) {
  res.render("index");
});

export default app;
