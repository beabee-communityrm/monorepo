import bodyParser from 'body-parser';
import express, { type Express } from 'express';

import { log as mainLogger } from '@beabee/core/logging';
import { stripe } from '@beabee/core/lib/stripe';
import { StripeWebhookEventHandler } from '@beabee/core/lib/stripe-webhook-event-handler';
import { wrapAsync } from '@beabee/core/utils/express';

import config from '@beabee/core/config';

const log = mainLogger.child({ app: 'webhook-stripe' });

const stripeWebhookApp: Express = express();

stripeWebhookApp.use(bodyParser.raw({ type: 'application/json' }));

stripeWebhookApp.get('/', (req, res) => res.sendStatus(200));

stripeWebhookApp.post(
  '/',
  wrapAsync(async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    try {
      const evt = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );

      log.info(`Got webhook ${evt.id} ${evt.type}`);
      await StripeWebhookEventHandler.handleEvent(evt);
    } catch (err: any) {
      log.error(`Got webhook error: ${err.message}`, err);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    res.sendStatus(200);
  })
);

export { stripeWebhookApp };
