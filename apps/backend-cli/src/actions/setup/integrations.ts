import { config } from '@beabee/core/config';
import { createInstance } from '@beabee/core/lib/mailchimp';
import { STRIPE_WEBHOOK_EVENTS, Stripe, stripe } from '@beabee/core/lib/stripe';
import { currentLocale } from '@beabee/core/locale';
import { KNOWN_WEBHOOK_EVENTS } from '@beabee/core/providers/newsletter/MailchimpProvider';
import { runApp } from '@beabee/core/server';
import { newsletterService } from '@beabee/core/services/NewsletterService';
import { optionsService } from '@beabee/core/services/OptionsService';
import { MCWebhook } from '@beabee/core/type';

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

      if (
        existingWebhook &&
        existingWebhook.api_version !== config.stripe.version
      ) {
        console.warn(
          `⚠️ Webhook API version mismatch: expected ${config.stripe.version}, got ${existingWebhook.api_version}`
        );
        if (!dryRun) {
          await stripe.webhookEndpoints.del(existingWebhook.id);
        }
        console.log(`🗑️ Deleted existing webhook with wrong API version`);
        existingWebhook = undefined;
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

export const setupMailchimp = async (dryRun: boolean) => {
  if (config.newsletter.provider !== 'mailchimp') {
    throw new Error('BEABEE_NEWSLETTER_PROVIDER must be mailchimp');
  }
  console.log('Setting up Mailchimp integration...\n');

  if (dryRun) {
    console.log('⚠️ Running in dry-run mode. No changes will be made.');
  }

  const { listId, webhookSecret } = config.newsletter.settings;
  const mailchimp = createInstance(config.newsletter.settings);

  // Member and admin changes should trigger our webhook, but not our own API
  // changes (which would cause a sync loop)
  const sources = { user: true, admin: true, api: false };
  const events = Object.fromEntries(KNOWN_WEBHOOK_EVENTS.map((e) => [e, true]));

  try {
    await runApp(async () => {
      // Step 1: Check/create webhook
      const webhookUrl = `${config.webhookUrl}/webhook/mailchimp?secret=${webhookSecret}`;
      const { data } = await mailchimp.instance.get<{ webhooks: MCWebhook[] }>(
        `lists/${listId}/webhooks`
      );

      const existingWebhook = data.webhooks.find((w) => w.url === webhookUrl);

      /** @deprecated One-time migration for old webhook URLs */
      if (!existingWebhook) {
        const oldWebhookUrl = `${config.audience}/webhook/mailchimp?secret=${webhookSecret}`;
        const oldWebhook = data.webhooks.find((w) => w.url === oldWebhookUrl);
        if (oldWebhook) {
          if (!dryRun) {
            await mailchimp.instance.delete(
              `lists/${listId}/webhooks/${oldWebhook.id}`
            );
          }
          console.log(`🗑️ Deleted old webhook with URL ${oldWebhookUrl}`);
        }
      }

      if (existingWebhook) {
        if (!dryRun) {
          await mailchimp.instance.patch(
            `lists/${listId}/webhooks/${existingWebhook.id}`,
            { events, sources }
          );
        }
        console.log(`✅ Updated existing webhook: ${existingWebhook.id}`);
      } else {
        console.log('Creating Mailchimp webhook...');
        if (dryRun) {
          console.log(`✅ Created webhook: [DRY RUN]`);
        } else {
          const { data: webhook } = await mailchimp.instance.post(
            `lists/${listId}/webhooks`,
            { url: webhookUrl, events, sources }
          );
          console.log(`✅ Created webhook: ${webhook.id}`);
        }
      }

      // Step 2: Cache newsletter groups
      const mailchimpGroups = await newsletterService.getAllNewsletterGroups();
      if (dryRun) {
        console.log(
          `Added ${mailchimpGroups.length} newsletter groups: [DRY RUN]`
        );
      } else {
        await optionsService.setJSON('newsletter-groups', mailchimpGroups);
        console.log(`✅ Cached ${mailchimpGroups.length} newsletter groups`);
      }

      console.log('\n🎉 Mailchimp integration setup completed successfully!');
    });
  } catch (error) {
    console.error('❌ Mailchimp integration setup failed:');
    console.error(error);
    throw error;
  }
};
