import { MailchimpNewsletterConfig } from '#config/config';
import {
  createInstance,
  getMCMemberUrl,
  mcMemberToNlContact,
  nlContactToMCMember,
} from '#lib/mailchimp';
import {
  MCMember,
  MCMemberList,
  MCOperation,
  NewsletterBulkProvider,
  NewsletterContact,
  NewsletterFetchContactsOpts,
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
   * Add or remove tags for the given contacts
   *
   * @param updates The list of contact email and tag updates
   */
  async updateContactTags(
    updates: { email: string; tags: { name: string; active: boolean }[] }[]
  ): Promise<void> {
    const operations: MCOperation[] = updates.map((update) => ({
      path: getMCMemberUrl(this.listId, update.email) + '/tags',
      method: 'POST',
      body: JSON.stringify({
        tags: update.tags.map((tag) => ({
          name: tag.name,
          status: tag.active ? 'active' : 'inactive',
        })),
      }),
      operation_id: `update_tags_${update.email}`,
    }));
    await this.api.dispatchOperations(operations);
  }

  /**
   * Get all the contacts in the newsletter list
   *
   * @param opts Options to filter the contacts
   * @returns The list of newsletter contacts
   */
  async fetchContacts(
    opts?: NewsletterFetchContactsOpts
  ): Promise<NewsletterContact[]> {
    const operation: MCOperation = {
      path: `lists/${this.listId}/members`,
      method: 'GET',
      operation_id: 'get',
      params: {
        limit: '1000',
        ...(opts?.since && {
          since_timestamp_opt: opts.since.toISOString(),
        }),
        ...(opts?.until && {
          before_timestamp_opt: opts.until.toISOString(),
        }),
      },
    };

    // Performance optimization: when filtering, try to get all members in a
    // single request If their are less than 1000 results then this uses many
    // fewer API calls, otherwise fall back to batching
    if (opts) {
      const response =
        await this.api.dispatchOperation<MCMemberList>(operation);
      if (response.total_items < 1000) {
        return response.members.map(mcMemberToNlContact);
      }
    }

    const batch = await this.api.createBatch([operation]);
    const finishedBatch = await this.api.waitForBatch(batch);
    const batchResponses =
      await this.api.getBatchResponses<MCMemberList>(finishedBatch);

    return batchResponses.flatMap((r) => r.members).map(mcMemberToNlContact);
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
