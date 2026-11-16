import { ActivityActorType } from '@beabee/beabee-common';
import { actorContext } from '@beabee/core/lib/actor-context';
import { log, requestErrorLogger, requestLogger } from '@beabee/core/logging';
import { initApp, startServer } from '@beabee/core/server';
import OptionsService, {
  OptionKey,
} from '@beabee/core/services/OptionsService';
// Temporary: apps must not import each other, this one hosts the legacy app
// only until it is removed
import { initLegacyApp } from '@beabee/legacy';

import express, { Handler, Request, Response } from 'express';

import { gocardlessWebhookApp } from '#handlers/gocardless';
import { mailchimpWebhookApp } from '#handlers/mailchimp';
import { stripeWebhookApp } from '#handlers/stripe';
import { zitadelWebhookApp } from '#handlers/zitadel';

function checkOpt(key: OptionKey): Handler {
  return (req, res, next) => {
    if (OptionsService.getBool(key)) {
      next();
    } else {
      next('router');
    }
  };
}

const webhookPaths = ['/ping', '/gc', '/mailchimp', '/stripe', '/zitadel'];

const app = express();

app.use(webhookPaths, requestLogger);

app.get('/ping', function (req: Request, res: Response) {
  res.sendStatus(200);
});

// Run downstream actions with actor type 'webhook'
app.use(webhookPaths, (req, res, next) =>
  actorContext.run(
    { actorType: ActivityActorType.Webhook, actorId: null },
    next
  )
);

app.use('/gc', checkOpt('switch-webhook-gc'), gocardlessWebhookApp);
app.use(
  '/mailchimp',
  checkOpt('switch-webhook-mailchimp'),
  mailchimpWebhookApp
);
app.use('/stripe', checkOpt('switch-webhook-stripe'), stripeWebhookApp);
app.use('/zitadel', zitadelWebhookApp);

// Unhandled webhook requests end here instead of reaching the legacy app
app.use(webhookPaths, (req, res) => {
  res.sendStatus(404);
});

app.use(requestErrorLogger);

initApp()
  .then(async () => {
    // Everything that isn't a webhook is handled by the legacy app
    app.use(await initLegacyApp());
    startServer(app);
  })
  .catch((err) => {
    log.error('Error during initialization', err);
  });
