import { MailchimpNewsletterConfig } from '#config/config';
import {
  createInstance,
  getMCMemberUrl,
  mcMemberToNlContact,
  nlContactToMCMember,
} from '#lib/mailchimp';
import {
  MCMember,
  MCOperation,
  NewsletterBulkProvider,
  NewsletterContact,
  NewsletterGetContactOpts,
  UpdateNewsletterContact,
} from '#type';

export class MailchimpBulkProvider implements NewsletterBulkProvider {
  private readonly api;
  private readonly listId;

  constructor(settings: MailchimpNewsletterConfig['settings']) {
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
      path: getMCMemberUrl(this.listId, email) + '/tags',
      method: 'POST',
      body: JSON.stringify({
        tags: [{ name: tag, status: 'active' }],
      }),
      operation_id: `add_tag_${email}`,
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
      path: getMCMemberUrl(this.listId, email) + '/tags',
      method: 'POST',
      body: JSON.stringify({
        tags: [{ name: tag, status: 'inactive' }],
      }),
      operation_id: `remove_tag_${email}`,
    }));
    await this.api.dispatchOperations(operations);
  }

  /**
   * Get all the contacts in the newsletter list
   *
   * @param opts Options to filter the contacts
   * @returns The list of newsletter contacts
   */
  async getContacts(
    opts?: NewsletterGetContactOpts
  ): Promise<NewsletterContact[]> {
    const operation: MCOperation = {
      path: `lists/${this.listId}/members`,
      method: 'GET',
      operation_id: 'get',
      params: {
        ...(opts?.since && {
          since_timestamp_opt: opts.since.toISOString(),
        }),
        ...(opts?.until && {
          before_timestamp_opt: opts.until.toISOString(),
        }),
      },
    };

    const batch = await this.api.createBatch([operation]);
    const finishedBatch = await this.api.waitForBatch(batch);
    const responses = await this.api.getBatchResponses<{ members: MCMember[] }>(
      finishedBatch
    );

    return responses.flatMap((r) => r.members).map(mcMemberToNlContact);
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
        params: { skip_merge_validation: 'true' },
        method: 'PUT',
        body: JSON.stringify({ ...mcMember, status_if_new: mcMember.status }),
        operation_id: `update_${contact.email}`,
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
      method: 'DELETE',
      operation_id: `delete_${email}`,
    }));
    await this.api.dispatchOperations(
      operations,
      // Allow 404s and 405s on delete operations
      (status) => status < 400 || status === 404 || status === 405
    );
  }
}
