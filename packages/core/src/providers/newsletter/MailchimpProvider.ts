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
import { CantUpdateMCMember } from "#errors/CantUpdateMCMember";

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

  async getContact(email: string): Promise<NewsletterContact | undefined> {
    try {
      const resp = await this.api.instance.get(
        getMCMemberUrl(this.listId, email)
      );
      return mcMemberToNlContact(resp.data);
    } catch (err) {}
  }

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

  private async upsertMemberOrTryPending(
    member: UpdateNewsletterContact,
    oldEmail = member.email
  ): Promise<NewsletterContact> {
    const baseReq = {
      method: "PUT",
      url: getMCMemberUrl(this.listId, oldEmail),
      params: { skip_merge_validation: true }
    };

    const mcMember = nlContactToMCMember(member);

    const resp = await this.api.instance.request<any, UpsertMCMemberResponse>({
      ...baseReq,
      data: mcMember,
      // Don't error on 400s, we'll try to recover
      validateStatus: (status) => status <= 400
    });

    if (resp.status === 200) {
      log.info("Updated member " + member.email);
      return mcMemberToNlContact(resp.data);

      // Try to put the user into pending state if they're in a compliance state
      // This can happen if they previously unsubscribed or were cleaned
    } else if (
      member.status === NewsletterStatus.Subscribed &&
      resp.status === 400 &&
      resp.data?.title === "Member In Compliance State"
    ) {
      log.info(
        `Member ${member.email} had status ${resp.data.title}, trying to re-add them`
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

    throw new CantUpdateMCMember(member.email, resp.status, resp.data);
  }

  async upsertContact(
    member: UpdateNewsletterContact,
    oldEmail = member.email
  ): Promise<NewsletterStatus> {
    try {
      const updatedMember = await this.upsertMemberOrTryPending(
        member,
        oldEmail
      );

      if (updatedMember.isActiveMember !== member.isActiveMember) {
        log.info("Updating active member tag for " + member.email);
        const tagOp = member.isActiveMember
          ? "addTagToContacts"
          : "removeTagFromContacts";
        await this[tagOp](
          [updatedMember.email],
          OptionsService.getText("newsletter-active-member-tag")
        );
      }

      return updatedMember.status;
    } catch (err) {
      if (err instanceof CantUpdateMCMember) {
        log.error("Couldn't update member " + member.email, err);
        return NewsletterStatus.None;
      } else {
        throw err;
      }
    }
  }

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
