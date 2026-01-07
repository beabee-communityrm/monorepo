import { NewsletterStatus } from '@beabee/beabee-common';

import { MailchimpNewsletterConfig } from '#config/config';
import { CantUpdateNewsletterContact } from '#errors/CantUpdateNewsletterContact';
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

export class MailchimpProvider implements NewsletterProvider {
  private readonly api;
  private readonly listId;

  constructor(settings: MailchimpNewsletterConfig['settings']) {
    this.api = createInstance(settings);
    this.listId = settings.listId;
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

    throw new CantUpdateNewsletterContact(
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
}

/** @deprecated Use named import MailchimpProvider instead */
export default MailchimpProvider;
