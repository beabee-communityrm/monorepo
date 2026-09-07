import {
  BaseNewsletterGroupData,
  NewsletterDiffData,
  NewsletterIntegrationData,
  NewsletterStatus,
} from '@beabee/beabee-common';

import config from '#config/config';
import { createQueryBuilder, getRepository } from '#database';
import {
  CantUpdateNewsletterContactError,
  CantUpdateNewsletterGroupsError,
} from '#errors/index';
import { log as mainLogger } from '#logging';
import { Callout, Contact, ContactProfile, Content } from '#models/index';
import {
  MailchimpProvider,
  NoneProvider,
  TestProvider,
} from '#providers/newsletter/index';
import {
  ContactNewsletterUpdates,
  NewsletterContact,
  NewsletterGroupChange,
  NewsletterProvider,
  UpdateNewsletterContact,
} from '#type/index';
import { convertContactToNlUpdate } from '#utils/newsletter';

import emailService from './EmailService.js';
import optionsService from './OptionsService.js';

const log = mainLogger.child({ app: 'newsletter-service' });

/**
 * Ensure the contact profile is loaded then creates a newsletter update object
 * to be sent to the newsletter provider
 *
 * @param contact The contact
 * @param updates Optional updates to apply
 * @param opts Update options
 * @returns
 */
async function contactToNlUpdate(
  contact: Contact,
  updates?: ContactNewsletterUpdates,
  opts?: { newsletterGroupChange?: NewsletterGroupChange }
): Promise<UpdateNewsletterContact | undefined> {
  // TODO: Fix that it relies on contact.profile being loaded
  if (!contact.profile) {
    contact.profile = await getRepository(ContactProfile).findOneByOrFail({
      contactId: contact.id,
    });
  }

  return convertContactToNlUpdate(contact, updates, opts);
}

function createProvider(): NewsletterProvider {
  switch (config.newsletter.provider) {
    case 'mailchimp':
      return new MailchimpProvider(config.newsletter.settings);
    case 'test':
      return new TestProvider();
    default:
      return new NoneProvider();
  }
}

class NewsletterService {
  private readonly provider: NewsletterProvider = createProvider();

  /**
   * Updates or inserts a contact in the newsletter provider and handles status
   * changes. The contact should have already been updated before calling this
   * method, the updates parameter is just a way to flag the relevant changes
   *
   * @param contact The contact to update or insert
   * @param updates Optional updates to apply to the contact before syncing
   * @param opts.oldEmail Previous email address if the email is being updated
   * @param opts.newsletterGroupChange How `updates.newsletterGroups` should be
   * applied
   */
  async upsertContact(
    contact: Contact,
    updates?: ContactNewsletterUpdates,
    opts?: {
      oldEmail?: string;
      newsletterGroupChange?: NewsletterGroupChange;
    }
  ): Promise<void> {
    const nlUpdate = await contactToNlUpdate(contact, updates, opts);
    if (!nlUpdate) {
      // In case something's misconfigured (e.g. a stale newsletterStatus),
      // don't silently report success for a group change that was requested
      // but never actually happened.
      if (updates?.newsletterGroups) {
        throw new Error(
          `Newsletter groups could not be updated for contact ${contact.id}: the update was skipped`
        );
      }
      log.info('Ignoring contact update for ' + contact.id);
      return;
    }

    // A contact with no newsletter status isn't sent to the provider at all,
    // their groups are just cleared
    const newState: Pick<NewsletterContact, 'status' | 'groups'> =
      nlUpdate.status === NewsletterStatus.None
        ? { status: NewsletterStatus.None, groups: [] }
        : await this.upsertContactToProvider(contact, nlUpdate, opts?.oldEmail);

    // TODO: remove dependency on ContactProfile
    await getRepository(ContactProfile).update(contact.id, {
      newsletterStatus: newState.status,
      newsletterGroups: newState.groups,
    });
    contact.profile.newsletterStatus = newState.status;
    contact.profile.newsletterGroups = newState.groups;
  }

  /**
   * Send a prepared update to the newsletter provider and return the status
   * and groups it reports back. An invalid group ID is retried once, after
   * refreshing the cached group list.
   */
  private async upsertContactToProvider(
    contact: Contact,
    nlUpdate: UpdateNewsletterContact,
    oldEmail: string | undefined,
    attempt = 0
  ): Promise<Pick<NewsletterContact, 'status' | 'groups'>> {
    try {
      log.info('Upsert contact ' + contact.id);
      const newState = await this.provider.upsertContact(nlUpdate, oldEmail);

      log.info(
        `Got newsletter groups and status ${newState.status} for contact ${contact.id}`,
        { groups: newState.groups }
      );

      return newState;
    } catch (err) {
      // The newsletter provider rejected the update, set this contact's
      // newsletter status to None to prevent further updates
      if (err instanceof CantUpdateNewsletterContactError) {
        log.warning(
          `Newsletter upsert failed, setting status to none for contact ${contact.id}`,
          err
        );
        return { status: NewsletterStatus.None, groups: [] };
      }

      const partialGroupUpdate =
        nlUpdate.newsletterGroupChange === 'add' ||
        nlUpdate.newsletterGroupChange === 'remove';

      // A partial update scopes the payload to the given group IDs, so
      // refreshing the cached group list can't change what gets sent. A group
      // ID still invalid after one refresh is permanently invalid, so fail
      // loudly rather than retrying forever.
      if (
        err instanceof CantUpdateNewsletterGroupsError &&
        attempt === 0 &&
        !partialGroupUpdate
      ) {
        log.warning(
          `Failed to subscribe ${contact.email} to group. ${err.detail}\nGroups will be refreshed and the upsert retried.`
        );

        await this.refreshNewsletterGroups();
        return this.upsertContactToProvider(
          contact,
          nlUpdate,
          oldEmail,
          attempt + 1
        );
      }

      throw err;
    }
  }

  /**
   * Update the merge fields of a contact in the newsletter provider. This
   * method merges the field updates with the contact's current fields, so it
   * overwrites any existing fields with the new values, but does not remove any
   * fields that are not included in the update.
   *
   * @param contact The contact to update
   * @param fields The fields to set
   */
  async updateContactFields(
    contact: Contact,
    fields: Record<string, string>
  ): Promise<void> {
    log.info(`Update contact fields for ${contact.id}`, fields);
    const nlUpdate = await contactToNlUpdate(contact);
    if (nlUpdate) {
      await this.provider.updateContactFields(nlUpdate.email, fields);
    } else {
      log.info('Ignoring contact field update for ' + contact.id);
    }
  }

  /**
   * Permanently remove a contact from the newsletter provider
   *
   * @param contact The contact to delete
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    log.info(`Delete contact ${contact.id}`);
    const nlUpdate = await contactToNlUpdate(contact);
    if (nlUpdate) {
      await this.provider.permanentlyDeleteContact(nlUpdate.email);
    }
  }

  /**
   * Get a single newsletter contact from the newsletter provider
   *
   * @param email The contact's email address
   * @returns The newsletter contact
   */
  async getNewsletterContact(
    email: string
  ): Promise<NewsletterContact | undefined> {
    return await this.provider.getContact(email);
  }

  /**
   * Get newsletter integration information: provider (none/mailchimp), audience ID,
   * and configured groups (from options table -> newsletter-groups). If
   * `withHealth` is set, also include the health status (healthy/unhealthy/disabled)
   * @returns provider name, audience ID, groups, and optionally health status
   */
  async getProviderInfo(
    withHealth = false
  ): Promise<NewsletterIntegrationData> {
    return await this.provider.getProviderInfo(withHealth);
  }

  /**
   * Get the list of newsletter groups configured on the newsletter provider's
   * backend (e.g. Mailchimp interests on the configured audience).
   *
   * @returns The available groups as `{ id, label }` pairs
   */
  async getAllNewsletterGroups(): Promise<BaseNewsletterGroupData[]> {
    return await this.provider.getGroups();
  }

  /**
   * Get the newsletter groups a contact is currently subscribed to
   *
   * @param contactId The contact's ID
   * @returns The subscribed groups as `{ id, label }` pairs
   */
  async getContactNewsletterGroups(
    contactId: string
  ): Promise<BaseNewsletterGroupData[]> {
    const contactProfile = await getRepository(ContactProfile).findOneByOrFail({
      contactId,
    });
    const newsletterGroups: BaseNewsletterGroupData[] =
      optionsService.getJSON('newsletter-groups');

    const validGroupIds = new Set(newsletterGroups.map((g) => g.id));
    return newsletterGroups.filter(
      (g) =>
        contactProfile.newsletterGroups.includes(g.id) &&
        validGroupIds.has(g.id)
    );
  }

  /**
   * Unsubscribe a contact from a single newsletter group, without disturbing
   * their subscription to any other group.
   *
   * @param contact The contact to update
   * @param groupId The newsletter group ID to unsubscribe from
   */
  async unsubscribeFromNewsletterGroup(
    contact: Contact,
    groupId: string
  ): Promise<void> {
    await this.upsertContact(
      contact,
      { newsletterGroups: [groupId] },
      { newsletterGroupChange: 'remove' }
    );
  }

  /**
   * Get newsletter provider's groups, compare them against
   * groups cached in the database, and update cache if needed.
   * If any groups were deleted, remove them from contact profiles, callouts
   * and join content. Finally, return diff alongside provider
   * integration info.
   *
   * @returns Newsletter integration info and a list of group changes, where each
   * change contains group id, label, and an action (added: present
   * on the provider but not cached OR removed": cached but no longer on the provider)
   */
  async refreshNewsletterGroups(dryRun = false): Promise<NewsletterDiffData> {
    log.info('Refreshing newsletter groups' + (dryRun ? ' - DRY RUN' : ''));

    // Groups cached in DB
    const cachedGroups: BaseNewsletterGroupData[] =
      optionsService.getJSON('newsletter-groups');

    // Groups configured with provider
    const providerGroups = await this.provider.getGroups();

    const cachedIds = new Set(cachedGroups.map((g) => g.id));
    const providerIds = new Set(providerGroups.map((g) => g.id));

    const diff = [
      ...providerGroups
        .filter((g) => !cachedIds.has(g.id))
        .map((g) => ({ ...g, action: 'added' as const })),
      ...cachedGroups
        .filter((g) => !providerIds.has(g.id))
        .map((g) => ({ ...g, action: 'removed' as const })),
    ];
    if (!dryRun) {
      if (diff.length > 0) {
        // Update cache
        optionsService.setJSON('newsletter-groups', providerGroups);

        const removedGroups = diff.filter((g) => g.action === 'removed');

        // Clean up if any groups were deleted by the provider
        if (removedGroups.length > 0) {
          log.info(
            `🧹 Deleted groups detected during refresh: ${removedGroups.map((group) => group.label).join(', ')}. Cleaning up..`
          );
          const removedIds = removedGroups.map((g) => g.id);

          log.info('Removing deleted groups from contact_profile');
          // 1. Remove from contacts
          await createQueryBuilder()
            .update(ContactProfile)
            .set({
              newsletterGroups: () => `COALESCE((
              SELECT jsonb_agg(elem)
              FROM jsonb_array_elements_text("newsletterGroups") elem
              WHERE elem != ALL(:removedIds)
            ), '[]'::jsonb)`,
            })
            .where(`"newsletterGroups" ?| :removedIds`)
            .setParameters({ removedIds })
            .execute();

          // 2. Remove from join flow (join/setup content)
          log.info('Removing deleted groups from join/setup content');
          await createQueryBuilder()
            .update(Content)
            .set({
              data: () => `jsonb_set(data, '{newsletterGroups}', COALESCE((
              SELECT jsonb_agg(elem)
              FROM jsonb_array_elements(data->'newsletterGroups') elem
              WHERE elem->>'id' != ALL(:removedIds)
            ), '[]'::jsonb))`,
            })
            .where(`id = :id`)
            .setParameters({ id: 'join/setup', removedIds })
            .execute();

          // 3. Remove from callouts
          log.info('Removing deleted groups from callout newsletter schemas');
          await createQueryBuilder()
            .update(Callout)
            .set({
              newsletterSchema:
                () => `jsonb_set("newsletterSchema", '{groups}', COALESCE((
              SELECT jsonb_agg(elem)
              FROM jsonb_array_elements("newsletterSchema"->'groups') elem
              WHERE elem->>'id' != ALL(:removedIds)
            ), '[]'::jsonb))`,
            })
            .where(`"newsletterSchema" IS NOT NULL`)
            .setParameters({ removedIds })
            .execute();

          // 4. Notify admin
          await emailService.sendTemplateToAdmin('deleted-newsletter-group', {
            groups: removedGroups,
          });
        }
      }
    }

    const providerInfo = await this.getProviderInfo(true);
    return { info: providerInfo, groupChanges: diff };
  }
}

export const newsletterService = new NewsletterService();
export default newsletterService;
