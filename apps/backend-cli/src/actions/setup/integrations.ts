import { config } from '@beabee/core/config';
import { STRIPE_WEBHOOK_EVENTS, Stripe, stripe } from '@beabee/core/lib/stripe';
import { currentLocale } from '@beabee/core/locale';
import { runApp } from '@beabee/core/server';
import { optionsService } from '@beabee/core/services/OptionsService';

const PRIVATE_HOST_PATTERN =
  /^(localhost|127\.|0\.0\.0\.0|::1|\[::1\]|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i;

function isPubliclyAccessibleUrl(rawUrl: string): boolean {
  try {
    return !PRIVATE_HOST_PATTERN.test(new URL(rawUrl).hostname);
  } catch {
    return false;
  }
}

export const setupStripe = async (dryRun: boolean) => {
  if (!config.stripe.secretKey) {
    throw new Error(
      'BEABEE_STRIPE_SECRETKEY must be set before running Stripe setup'
    );
  }

  console.log('Setting up Stripe integration...\n');

  if (dryRun) {
    console.log('⚠️ Running in dry-run mode. No changes will be made.');
  }

  try {
    await runApp(async () => {
      // Step 1: Check/create membership product
      const productId = optionsService.getText('stripe-membership-product-id');

      if (productId) {
        console.log(`✅ Membership product already exists: ${productId}`);
      } else {
        console.log('Creating Stripe membership product...');
        if (dryRun) {
          console.log(`✅ Created membership product: [DRY RUN]`);
        } else {
          const product = await stripe.products.create({
            name: currentLocale().paymentLabels.membershipProductName,
          });
          await optionsService.set('stripe-membership-product-id', product.id);
          console.log(`✅ Created membership product: ${product.id}`);
        }
      }

      // Step 2: Check/create webhook
      const existingWebhookSecret = optionsService.getText(
        'stripe-webhook-secret'
      );
      const webhookUrl = `${config.webhookUrl}/webhook/stripe`;

      // Stripe (since the 2025 API versions, enforced on `2026-04-22.dahlia`)
      // rejects webhook endpoints whose URL is not publicly reachable. Local
      // development uses the `stripe_cli` container's `stripe listen
      // --forward-to webhook_app:3000/stripe` instead, so registering an
      // endpoint here is both unnecessary and impossible.
      if (!isPubliclyAccessibleUrl(webhookUrl)) {
        console.log(
          `⏭️  Skipping Stripe webhook setup — '${webhookUrl}' is not publicly reachable.`
        );
        console.log(
          '   For local development the docker-compose `stripe_cli` service forwards events.'
        );
        console.log(
          '   For staging/production, set BEABEE_WEBHOOKURL to a public HTTPS URL and re-run setup.'
        );
        console.log('\n🎉 Stripe integration setup completed successfully!');
        return;
      }

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
            if (!dryRun) {
              await stripe.webhookEndpoints.del(webhook.id);
            }
            console.log(`🗑️ Deleted old webhook with URL ${oldWebhookUrl}`);
          } else {
            console.warn(`⚠️ Webhook secret exists but no webhook found`);
          }
        }
      }

      if (existingWebhook) {
        if (!dryRun) {
          await stripe.webhookEndpoints.update(existingWebhook.id, {
            enabled_events: [...STRIPE_WEBHOOK_EVENTS],
          });
        }
        console.log(`✅ Updated existing webhook: ${existingWebhook.id}`);
      } else {
        console.log('Creating Stripe webhook...');
        if (dryRun) {
          console.log(`✅ Created webhook endpoint: [DRY RUN]`);
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
          console.log(`✅ Created webhook endpoint: ${webhookEndpoint.id}`);
        }
      }

      console.log('\n🎉 Stripe integration setup completed successfully!');
    });
  } catch (error) {
    console.error('❌ Stripe integration setup failed:');
    console.error(error);
    throw error;
  }
};
