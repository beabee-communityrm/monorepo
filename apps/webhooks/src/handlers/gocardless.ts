import bodyParser from "body-parser";
import express, { type Express, type Request, type Response } from "express";

import { log as mainLogger } from "@beabee/core/logging";
import gocardless from "@beabee/core/lib/gocardless";
import { GoCardlessWebhookEventHandler } from "@beabee/core/lib/gocardless-webhook-event-handler";
import { wrapAsync } from "@beabee/core/utils/index";

const log = mainLogger.child({ app: "webhook-gocardless" });

const gocardlessWebhookApp: Express = express();

const textBodyParser = bodyParser.text({
  type: "application/json",
  limit: "1mb"
});

gocardlessWebhookApp.get("/", (req: Request, res: Response) =>
  res.sendStatus(200)
);

gocardlessWebhookApp.post(
  "/",
  textBodyParser,
  wrapAsync(async (req: Request, res: Response) => {
    const valid = gocardless.webhooks.validate(req);

    if (valid) {
      const events = JSON.parse(req.body).events;
      log.info(`Got ${events.length} events`);
      res.sendStatus(200);

      try {
        await GoCardlessWebhookEventHandler.handleEvents(events);
      } catch (error) {
        log.error("Error while processing events", error);
        res.sendStatus(500);
      }
    } else {
      log.error("Invalid webhook signature");
      res.sendStatus(498);
    }
  })
);

export { gocardlessWebhookApp };
