import {
  ApiHealthStatus,
  MailchimpNewsletterIntegrationData,
  NewsletterStatus,
} from '@beabee/beabee-common';

import config, { MailchimpNewsletterConfig } from '#config/config';
import { CantUpdateNewsletterContactError } from '#errors/index';
import {
  createInstance,
  getMCMemberUrl,
  mcMemberToNlContact,
  nlContactToMCMember,
} from '#lib/mailchimp';
import { log as mainLogger } from '#logging';
import OptionsService from '#services/OptionsService';
import {
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact,
  UpsertMCMemberResponse,
} from '#type/index';

const log = mainLogger.child({ app: 'mailchimp-provider' });

interface MCWebhook {
  url: string;
  sources: { user: boolean; admin: boolean; api: boolean };
  events: Record<string, boolean>;
}

/**
 * Mailchimp webhook events that the webhook handler in apps/webhooks processes
 * and therefore must be enabled on the Mailchimp webhook. Source of truth for
 * the handler's known webhook types.
 */
export const KNOWN_WEBHOOK_EVENTS: readonly string[] = [
  'subscribe',
  'unsubscribe',
  'profile',
  'upemail',
  'cleaned',
];

export class MailchimpProvider implements NewsletterProvider {
  private readonly api;
  private readonly listId;
  private readonly webhookSecret;

  constructor(settings: MailchimpNewsletterConfig['settings']) {
    this.api = createInstance(settings);
    this.listId = settings.listId;
    this.webhookSecret = settings.webhookSecret;
  }

  /**
   * Get the newsletter contact with the given email address
   *
   * @param email The email address of the contact
   * @returns The contact or undefined if not found
   */
  async getContact(email: string): Promise<NewsletterContact | undefined> {
    try {
      const resp = await this.api.instance.get(
        getMCMemberUrl(this.listId, email)
      );
      return mcMemberToNlContact(resp.data);
    } catch (err) {}
  }

  /**
   * Upsert a newsletter contact to Mailchimp. If the contact has been unsubscribed or cleaned
   * then it get be automatically re-subscribed. In this case we attempt to set the status to
   * pending which will trigger a double opt-in email.
   *
   * @param contact The newsletter contact to upsert
   * @param oldEmail The old email address of the contact, if it has changed
   * @returns The updated newsletter contact
   */
  private async upsertContactOrTryPending(
    contact: UpdateNewsletterContact,
    oldEmail = contact.email
  ): Promise<NewsletterContact> {
    const baseReq = {
      method: 'PUT',
      url: getMCMemberUrl(this.listId, oldEmail),
      params: { skip_merge_validation: true },
    };

    const mcMember = nlContactToMCMember(contact);

    const resp = await this.api.instance.request<any, UpsertMCMemberResponse>({
      ...baseReq,
      data: mcMember,
      // Don't error on 400s, we'll try to recover
      validateStatus: (status) => status <= 400,
    });

    if (resp.status === 200) {
      log.info('Updated member ' + contact.email);
      return mcMemberToNlContact(resp.data);

      // Try to put the user into pending state if they're in a compliance state
      // This can happen if they previously unsubscribed or were cleaned
    } else if (
      contact.status === NewsletterStatus.Subscribed &&
      resp.status === 400 &&
      resp.data?.title === 'Member In Compliance State'
    ) {
      log.info(
        `Member ${contact.email} had status ${resp.data.title}, trying to re-add them`
      );
      const resp2 = await this.api.instance.request<
        any,
        UpsertMCMemberResponse
      >({
        ...baseReq,
        data: { ...mcMember, status: 'pending' },
      });

      if (resp2.status === 200) {
        return mcMemberToNlContact(resp2.data);
      }
    }

    throw new CantUpdateNewsletterContactError(
      contact.email,
      resp.status,
      resp.data
    );
  }

  /**
   * Upsert a contact and synchronise their active member status
   *
   * @param contact The newsletter contact to upsert
   * @param oldEmail The old email address of the contact, if it has changed
   * @returns The newsletter contact's new newsletter status
   */
  async upsertContact(
    contact: UpdateNewsletterContact,
    oldEmail = contact.email
  ): Promise<NewsletterContact> {
    log.info('Upsert contact ' + contact.email);

    const updatedContact = await this.upsertContactOrTryPending(
      contact,
      oldEmail
    );

    // Add/remove the active member tag if the statuses don't match
    if (
      updatedContact.isActiveMember !== contact.isActiveMember ||
      updatedContact.isActiveUser !== contact.isActiveUser
    ) {
      this.updateContactTags(updatedContact.email, {
        [OptionsService.getText('newsletter-active-member-tag')]:
          contact.isActiveMember,
        [OptionsService.getText('newsletter-active-user-tag')]:
          contact.isActiveUser,
      });
    }

    return updatedContact;
  }

  /**
   * Update a contact with the given tags. This will overwrite any existing tags
   * but will not remove any tags that are not provided.
   *
   * @param email The email address of the contact
   * @param tags The tags to add or remove
   */
  async updateContactTags(
    email: string,
    tags: Record<string, boolean>
  ): Promise<void> {
    log.info('Update tags for ' + email, { tags });

    await this.api.instance.post(getMCMemberUrl(this.listId, email) + '/tags', {
      tags: Object.entries(tags).map(([name, active]) => ({
        name,
        status: active ? 'active' : 'inactive',
      })),
    });
  }

  /**
   * Update a contact with the given fields. This will overwrite any existing fields
   * but will not remove any fields that are not provided.
   *
   * @param email The email address of the contact
   * @param fields The fields to update
   */
  async updateContactFields(
    email: string,
    fields: Record<string, string>
  ): Promise<void> {
    await this.api.instance.patch(
      getMCMemberUrl(this.listId, email),
      { merge_fields: fields },
      { params: { skip_merge_validation: 'true' } }
    );
  }

  /**
   * Permanently delete the contacts with the given email addresses, ignoring
   * any not found errors
   *
   * @param emails The list of email addresses to delete
   */
  async permanentlyDeleteContact(email: string): Promise<void> {
    await this.api.instance.post(
      getMCMemberUrl(this.listId, email) + '/actions/permanently-delete',
      undefined,
      {
        validateStatus: (status) =>
          status < 400 || status === 404 || status === 405,
      }
    );
  }

  /**
   * Get information about the Mailchimp integration: audience ID and the available
   * newsletter groups (from options table -> newsletter-groups).
   * If `withHealth` is set, also include the health status (healthy if the
   * audience is reachable and our webhook is installed, unhealthy otherwise).
   */
  async getProviderInfo(
    withHealth = false
  ): Promise<MailchimpNewsletterIntegrationData> {
    const resp: MailchimpNewsletterIntegrationData = {
      provider: 'mailchimp',
      audienceId: this.listId,
      groups: OptionsService.getJSON('newsletter-groups'),
    };

    if (withHealth) {
      resp.status = await this.getHealthStatus();
    }
    return resp;
  }

  /**
   * Check the Mailchimp integration is healthy: the audience is reachable and
   * our webhook is installed and correctly configured on the list.
   *
   * @returns HEALTHY if all checks pass, UNHEALTHY otherwise
   */
  private async getHealthStatus(): Promise<ApiHealthStatus> {
    try {
      // Check the audience/list is reachable
      await this.api.instance.get(`lists/${this.listId}`);

      // Find our webhook, matching the secret query param that the webhook
      // handler validates against
      const webhookUrl = `${config.webhookUrl}/webhook/mailchimp`;
      const expectedWebhookUrl = `${webhookUrl}?secret=${this.webhookSecret}`;
      const resp = await this.api.instance.get<{ webhooks: MCWebhook[] }>(
        `lists/${this.listId}/webhooks`
      );
      const webhook = resp.data.webhooks.find(
        (w) => w.url === expectedWebhookUrl
      );
      if (!webhook) {
        log.warning(
          `Mailchimp health check failed: no webhook found for ${webhookUrl}`
        );
        return ApiHealthStatus.UNHEALTHY;
      }

      // Triggered by member (user) and admin changes, but not by our own API
      // changes (which would cause a sync loop)
      if (
        !webhook.sources.user ||
        !webhook.sources.admin ||
        webhook.sources.api
      ) {
        log.warning(
          `Mailchimp health check failed: webhook sources misconfigured for ${webhookUrl}`
        );
        return ApiHealthStatus.UNHEALTHY;
      }

      // All events we handle must be enabled (we don't care about the rest)
      if (!KNOWN_WEBHOOK_EVENTS.every((event) => webhook.events[event])) {
        log.warning(
          `Mailchimp health check failed: webhook events misconfigured for ${webhookUrl}`
        );
        return ApiHealthStatus.UNHEALTHY;
      }

      return ApiHealthStatus.HEALTHY;
    } catch (err) {
      log.error('Mailchimp health check failed', err);
      return ApiHealthStatus.UNHEALTHY;
    }
  }

  /**
   * Get list of available newsletter groups
   *
   * @returns groups as `{ id, label }` pairs, where `id` is the
   * Mailchimp interest ID and `label` is its display name
   */
  async getGroups(): Promise<{ id: string; label: string }[]> {
    const interestCategories = await this.api.instance.get(
      `lists/${this.listId}/interest-categories`
    );
    const results = await Promise.all(
      interestCategories.data.categories.map((c: { id: string }) =>
        this.api.instance.get(
          `lists/${this.listId}/interest-categories/${c.id}/interests`
        )
      )
    );
    return results.flatMap((r) =>
      r.data.interests.map((i: { id: string; name: string }) => ({
        id: i.id,
        label: i.name,
      }))
    );
  }
}

/** @deprecated Use named import MailchimpProvider instead */
export default MailchimpProvider;
