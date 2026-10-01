import { JobName } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import { createInstance } from '@beabee/core/lib/mailchimp';
import { KNOWN_WEBHOOK_EVENTS } from '@beabee/core/providers/newsletter/MailchimpProvider';
import { newsletterService } from '@beabee/core/services/NewsletterService';
import { optionsService } from '@beabee/core/services/OptionsService';
import { MCWebhook } from '@beabee/core/type';

import { DryRunJobArgsDto } from '#api/dto/JobDto';
import type { Job } from '#type/job';

/**
 * Creates or updates the Mailchimp webhook for this instance and caches the
 * newsletter groups. Safe to rerun.
 */
export const mailchimpSetupJob: Job<JobName.MailchimpSetup> = {
  argsDto: DryRunJobArgsDto,
  async run(args, log) {
    if (config.newsletter.provider !== 'mailchimp') {
      throw new Error('BEABEE_NEWSLETTER_PROVIDER must be mailchimp');
    }

    if (args.dryRun) {
      log.info('⚠️ Running in dry-run mode. No changes will be made.');
    }

    const { listId, webhookSecret } = config.newsletter.settings;
    const mailchimp = createInstance(config.newsletter.settings);

    // Member and admin changes should trigger our webhook, but not our own API
    // changes (which would cause a sync loop)
    const sources = { user: true, admin: true, api: false };
    const events = Object.fromEntries(
      KNOWN_WEBHOOK_EVENTS.map((e) => [e, true])
    );

    // Step 1: Check/create webhook
    const webhookUrl = `${config.webhookUrl}/webhook/mailchimp`;
    const webhookUrlWithSecret = `${webhookUrl}?secret=${webhookSecret}`;

    const { data } = await mailchimp.instance.get<{ webhooks: MCWebhook[] }>(
      `lists/${listId}/webhooks`
    );

    let existingWebhook = data.webhooks.find((w) =>
      w.url.startsWith(webhookUrl)
    );

    /** @deprecated One-time migration for old webhook URLs */
    if (!existingWebhook) {
      const oldWebhookUrl = `${config.audience}/webhook/mailchimp`;
      existingWebhook = data.webhooks.find((w) =>
        w.url.startsWith(oldWebhookUrl)
      );
      if (existingWebhook) {
        log.info(
          `🗑️ Found old webhook with URL ${oldWebhookUrl}, will override it`
        );
      }
    }

    if (existingWebhook) {
      // Always update the URL in case the secret changed
      if (!args.dryRun) {
        await mailchimp.instance.patch(
          `lists/${listId}/webhooks/${existingWebhook.id}`,
          { url: webhookUrlWithSecret, events, sources }
        );
      }
      log.info(`✅ Updated existing webhook: ${existingWebhook.id}`);
    } else if (args.dryRun) {
      log.info('✅ Created webhook: [DRY RUN]');
    } else {
      const { data: webhook } = await mailchimp.instance.post(
        `lists/${listId}/webhooks`,
        { url: webhookUrlWithSecret, events, sources }
      );
      log.info(`✅ Created webhook: ${webhook.id}`);
    }

    // Step 2: Cache newsletter groups
    const mailchimpGroups = await newsletterService.getAllNewsletterGroups();
    if (args.dryRun) {
      log.info(`Added ${mailchimpGroups.length} newsletter groups: [DRY RUN]`);
    } else {
      await optionsService.setJSON('newsletter-groups', mailchimpGroups);
      log.info(`✅ Cached ${mailchimpGroups.length} newsletter groups`);
    }

    log.info('🎉 Mailchimp integration setup completed successfully!');
  },
};
