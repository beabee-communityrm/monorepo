import { JobName } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import { STRIPE_WEBHOOK_EVENTS, stripe } from '@beabee/core/lib/stripe';
import { currentLocale } from '@beabee/core/locale';
import { optionsService } from '@beabee/core/services/OptionsService';

import { DryRunJobArgsDto } from '#api/dto/JobDto';
import type { Job } from '#type/job';

/**
 * Creates the Stripe membership product and webhook endpoint for this
 * instance, or brings an existing webhook up to date. Safe to rerun.
 */
export const stripeSetupJob: Job<JobName.StripeSetup> = {
  argsDto: DryRunJobArgsDto,
  async run(args, log) {
    if (!config.stripe.secretKey) {
      throw new Error(
        'BEABEE_STRIPE_SECRETKEY must be set before running Stripe setup'
      );
    }

    if (args.dryRun) {
      log.info('⚠️ Running in dry-run mode. No changes will be made.');
    }

    // Step 1: Check/create membership product
    const productId = optionsService.getText('stripe-membership-product-id');

    if (productId) {
      log.info(`✅ Membership product already exists: ${productId}`);
    } else if (args.dryRun) {
      log.info('✅ Created membership product: [DRY RUN]');
    } else {
      const product = await stripe.products.create({
        name: currentLocale().paymentLabels.membershipProductName,
      });
      await optionsService.set('stripe-membership-product-id', product.id);
      log.info(`✅ Created membership product: ${product.id}`);
    }

    // Step 2: Check/create webhook
    const existingWebhookSecret = optionsService.getText(
      'stripe-webhook-secret'
    );
    const webhookUrl = `${config.webhookUrl}/webhook/stripe`;

    let existingWebhook;
    if (existingWebhookSecret) {
      const webhookEndpoints = await stripe.webhookEndpoints.list();
      existingWebhook = webhookEndpoints.data.find(
        (endpoint) => endpoint.url === webhookUrl
      );

      /** @deprecated One-time migration for old webhook URLs */
      if (!existingWebhook) {
        const oldWebhookUrl = `${config.audience}/webhook/stripe`;
        const webhook = webhookEndpoints.data.find(
          (endpoint) => endpoint.url === oldWebhookUrl
        );
        if (webhook) {
          if (!args.dryRun) {
            await stripe.webhookEndpoints.del(webhook.id);
          }
          log.info(`🗑️ Deleted old webhook with URL ${oldWebhookUrl}`);
        } else {
          log.warning('⚠️ Webhook secret exists but no webhook found');
        }
      }
    }

    if (
      existingWebhook &&
      existingWebhook.api_version !== config.stripe.version
    ) {
      log.warning(
        `⚠️ Webhook API version mismatch: expected ${config.stripe.version}, got ${existingWebhook.api_version}`
      );
      if (!args.dryRun) {
        await stripe.webhookEndpoints.del(existingWebhook.id);
      }
      log.info('🗑️ Deleted existing webhook with wrong API version');
      existingWebhook = undefined;
    }

    if (existingWebhook) {
      if (!args.dryRun) {
        await stripe.webhookEndpoints.update(existingWebhook.id, {
          enabled_events: [...STRIPE_WEBHOOK_EVENTS],
        });
      }
      log.info(`✅ Updated existing webhook: ${existingWebhook.id}`);
    } else if (args.dryRun) {
      log.info('✅ Created webhook endpoint: [DRY RUN]');
    } else {
      const webhookEndpoint = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: [...STRIPE_WEBHOOK_EVENTS],
        api_version: config.stripe.version,
        description: `Beabee webhook - created ${new Date().toISOString()}`,
      });

      await optionsService.set(
        'stripe-webhook-secret',
        webhookEndpoint.secret as string
      );
      log.info(`✅ Created webhook endpoint: ${webhookEndpoint.id}`);
    }

    log.info('🎉 Stripe integration setup completed successfully!');
  },
};
