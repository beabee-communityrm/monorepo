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
    if (opts?.updated || !opts?.emails) {
      // If there are updated filters or no filters at all fetch using the list
      // endpoint. If the email filter is also provided we filter the results
      // later as Mailchimp doesn't support email filtering on the list endpoint
      const operation: MCOperation = {
        path: `lists/${this.listId}/members`,
        method: 'GET',
        operation_id: 'get',
        params: {
          count: '1000',
          ...(opts?.updated?.since && {
            since_last_changed: opts.updated.since.toISOString(),
          }),
          ...(opts?.updated?.until && {
            before_last_changed: opts.updated.until.toISOString(),
          }),
        },
      };

      let members: MCMember[] | null = null;

      // Performance optimization: when filtering, try to get all members in a
      // single request If their are 1000 results or less then this uses many
      // fewer API calls, otherwise fall back to batching
      if (opts) {
        const response =
          await this.api.dispatchOperation<MCMemberList>(operation);
        if (response && response.total_items <= 1000) {
          members = response.members;
        }
      }

      if (!members) {
        const batch = await this.api.createBatch([operation]);
        const finishedBatch = await this.api.waitForBatch(batch);
        const responses =
          await this.api.getBatchResponses<MCMemberList>(finishedBatch);
        members = responses.flatMap((r) => r.members);
      }

      return members
        .filter((m) => !opts?.emails || opts.emails.includes(m.email_address))
        .map(mcMemberToNlContact);
    } else {
      // If only filtering by emails, fetch each member directly
      const operations: MCOperation[] = opts.emails.map((email) => ({
        path: getMCMemberUrl(this.listId, email),
        method: 'GET',
        operation_id: `get_${email}`,
      }));

      const batch = await this.api.createBatch(operations);
      const finishedBatch = await this.api.waitForBatch(batch);
      const responses = await this.api.getBatchResponses<MCMember>(
        finishedBatch,
        (status) => status === 200 || status === 404
      );

      return responses.map(mcMemberToNlContact);
    }
  }

  /**
   * Upserts the list of contacts to the newsletter provider. This method does
   * not give any guarantees about the active member tag.
   *
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
