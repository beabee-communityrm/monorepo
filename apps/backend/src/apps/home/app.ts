import express, { type Express } from "express";
import OptionsService, {
  OptionKey
} from "@beabee/core/services/OptionsService";

const app: Express = express();

app.set("views", __dirname + "/views");

app.get("/", (req, res, next) => {
  const redirectUrlOpt: OptionKey = req.user
    ? req.user.hasRole("admin")
      ? "admin-home-url"
      : "user-home-url"
    : "home-redirect-url";

  const redirectUrl = OptionsService.getText(redirectUrlOpt);
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
