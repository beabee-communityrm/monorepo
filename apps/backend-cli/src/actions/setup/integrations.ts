import { config } from '@beabee/core/config';
import { Stripe, stripe } from '@beabee/core/lib/stripe';
import { currentLocale } from '@beabee/core/locale';
import { runApp } from '@beabee/core/server';
import { optionsService } from '@beabee/core/services/OptionsService';

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

      const enabledEvents: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
        'checkout.session.completed',
        'customer.deleted',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.created',
        'invoice.updated',
        'invoice.paid',
        'invoice.payment_failed',
        'payment_method.detached',
      ];

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
            enabled_events: enabledEvents,
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
            enabled_events: enabledEvents,
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
