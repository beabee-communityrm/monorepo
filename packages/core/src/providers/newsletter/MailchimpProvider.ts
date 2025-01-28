import { NewsletterStatus } from "@beabee/beabee-common";

import { log as mainLogger } from "#logging";
import {
  createInstance,
  getMCMemberUrl,
  mcMemberToNlContact,
  nlContactToMCMember
} from "#lib/mailchimp";
import OptionsService from "#services/OptionsService";
import {
  MCMember,
  MCOperation,
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact,
  UpsertMCMemberResponse
} from "#type/index";

import { MailchimpNewsletterConfig } from "#config/config";
import { CantUpdateNewsletterContact } from "#errors/CantUpdateNewsletterContact";

const log = mainLogger.child({ app: "mailchimp-provider" });

interface GetMembersResponse {
  members: MCMember[];
}

export default class MailchimpProvider implements NewsletterProvider {
  private readonly api;
  private readonly listId;

  constructor(settings: MailchimpNewsletterConfig["settings"]) {
    this.api = createInstance(settings);
    this.listId = settings.listId;
  }

  /**
   * Add the given tag to the list of email addresses
   *
   * @param emails List of email addresses
   * @param tag The tag to add
   */
  async addTagToContacts(emails: string[], tag: string): Promise<void> {
    const operations: MCOperation[] = emails.map((email) => ({
      path: getMCMemberUrl(this.listId, email) + "/tags",
      method: "POST",
      body: JSON.stringify({
        tags: [{ name: tag, status: "active" }]
      }),
      operation_id: `add_tag_${email}`
    }));
    await this.api.dispatchOperations(operations);
  }

  /**
   * Remove the given tag from the list of email addresses
   *
   * @param emails List of email addresses
   * @param tag The tag to remove
   */
  async removeTagFromContacts(emails: string[], tag: string): Promise<void> {
    const operations: MCOperation[] = emails.map((email) => ({
      path: getMCMemberUrl(this.listId, email) + "/tags",
      method: "POST",
      body: JSON.stringify({
        tags: [{ name: tag, status: "inactive" }]
      }),
      operation_id: `remove_tag_${email}`
    }));
    await this.api.dispatchOperations(operations);
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
   * Get all the contacts in the newsletter list
   *
   * @returns The list of newsletter contacts
   */
  async getContacts(): Promise<NewsletterContact[]> {
    const operation: MCOperation = {
      path: `lists/${this.listId}/members`,
      method: "GET",
      operation_id: "get"
    };

    const batch = await this.api.createBatch([operation]);
    const finishedBatch = await this.api.waitForBatch(batch);
    const responses = (await this.api.getBatchResponses(
      finishedBatch
    )) as GetMembersResponse[];

    return responses.flatMap((r) => r.members).map(mcMemberToNlContact);
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
      method: "PUT",
      url: getMCMemberUrl(this.listId, oldEmail),
      params: { skip_merge_validation: true }
    };

    const mcMember = nlContactToMCMember(contact);

    const resp = await this.api.instance.request<any, UpsertMCMemberResponse>({
      ...baseReq,
      data: mcMember,
      // Don't error on 400s, we'll try to recover
      validateStatus: (status) => status <= 400
    });

    if (resp.status === 200) {
      log.info("Updated member " + contact.email);
      return mcMemberToNlContact(resp.data);

      // Try to put the user into pending state if they're in a compliance state
      // This can happen if they previously unsubscribed or were cleaned
    } else if (
      contact.status === NewsletterStatus.Subscribed &&
      resp.status === 400 &&
      resp.data?.title === "Member In Compliance State"
    ) {
      log.info(
        `Member ${contact.email} had status ${resp.data.title}, trying to re-add them`
      );
      const resp2 = await this.api.instance.request<
        any,
        UpsertMCMemberResponse
      >({
        ...baseReq,
        data: { ...mcMember, status: "pending" }
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
    const updatedContact = await this.upsertContactOrTryPending(
      contact,
      oldEmail
    );

    // Add/remove the active member tag if the statuses don't match
    if (updatedContact.isActiveMember !== contact.isActiveMember) {
      log.info("Updating active member tag for " + contact.email);
      const tagOp = contact.isActiveMember
        ? "addTagToContacts"
        : "removeTagFromContacts";
      await this[tagOp](
        [updatedContact.email],
        OptionsService.getText("newsletter-active-member-tag")
      );
    }

    return updatedContact;
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
    await this.api.dispatchOperations([
      {
        method: "PATCH",
        path: getMCMemberUrl(this.listId, email),
        params: { skip_merge_validation: "true" },
        body: JSON.stringify({ merge_fields: fields }),
        operation_id: `update_fields_${email}`
      }
    ]);
  }

  /**
   * Upserts the list of contacts to the newsletter provider. This method does
   * not give any guarantees about the active member tag.
   *
   * @deprecated Only used by legacy app newsletter sync, do not use.
   * @param nlContacts
   */
  async upsertContacts(nlContacts: UpdateNewsletterContact[]): Promise<void> {
    const operations: MCOperation[] = nlContacts.map((contact) => {
      const mcMember = nlContactToMCMember(contact);
      return {
        path: getMCMemberUrl(this.listId, contact.email),
        params: { skip_merge_validation: "true" },
        method: "PUT",
        body: JSON.stringify({ ...mcMember, status_if_new: mcMember.status }),
        operation_id: `update_${contact.email}`
      };
    });

    await this.api.dispatchOperations(operations);
  }

  /**
   * Archive the list of contact emails, ignoring any not found errors
   *
   * @param emails The list of email addresses to archive
   */
  async archiveContacts(emails: string[]): Promise<void> {
    const operations: MCOperation[] = emails.map((email) => ({
      path: getMCMemberUrl(this.listId, email),
      method: "DELETE",
      operation_id: `delete_${email}`
    }));
    await this.api.dispatchOperations(
      operations,
      // Allow 404s and 405s on delete operations
      (status) => status < 400 || status === 404 || status === 405
    );
  }

  /**
   * Permanently delete the contacts with the given email addresses, ignoring
   * any not found errors
   *
   * @param emails The list of email addresses to delete
   */
  async permanentlyDeleteContacts(emails: string[]): Promise<void> {
    const operations: MCOperation[] = emails.map((email) => ({
      path: getMCMemberUrl(this.listId, email) + "/actions/permanently-delete",
      method: "POST",
      operation_id: `delete-permanently_${email}`
    }));
    await this.api.dispatchOperations(
      operations,
      // Allow 404s and 405s on delete operations
      (status) => status < 400 || status === 404 || status === 405
    );
  }
}
