import { wrapAsync } from "@beabee/core/utils/async";
import express, { type Express, type Request, type Response } from "express";

const app: Express = express();

app.get(
  "/",
  wrapAsync(async function (req: Request, res: Response) {
    delete req.session.method;
    await new Promise<void>((resolve) => req.logout(resolve));
    req.flash("success", "logged-out");
    res.redirect("/");
  })
);

export default app;
