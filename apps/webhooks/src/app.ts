import { log, requestErrorLogger, requestLogger } from '@beabee/core/logging';
import { initApp, startServer } from '@beabee/core/server';
import OptionsService, {
  OptionKey,
} from '@beabee/core/services/OptionsService';

import express, { Handler, Request, Response } from 'express';

import { gocardlessWebhookApp } from '#handlers/gocardless';
import { mailchimpWebhookApp } from '#handlers/mailchimp';
import { stripeWebhookApp } from '#handlers/stripe';

function checkOpt(key: OptionKey): Handler {
  return (req, res, next) => {
    if (OptionsService.getBool(key)) {
      next();
    } else {
      next('router');
    }
  };
}

const app = express();

app.use(requestLogger);

app.get('/ping', function (req: Request, res: Response) {
  res.sendStatus(200);
});

app.use('/gc', checkOpt('switch-webhook-gc'), gocardlessWebhookApp);
app.use(
  '/mailchimp',
  checkOpt('switch-webhook-mailchimp'),
  mailchimpWebhookApp
);
app.use('/stripe', checkOpt('switch-webhook-stripe'), stripeWebhookApp);

app.use(requestErrorLogger);

initApp()
  .then(() => startServer(app))
  .catch((err) => {
    log.error('Error during initialization', err);
  });
