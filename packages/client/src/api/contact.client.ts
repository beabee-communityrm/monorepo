import { BaseClient } from "./base.client.ts";
import { cleanUrl } from "../utils/index.ts";
import { ContactMfaClient } from "./client-mfa.client.ts";
import { ContactContributionClient } from "./contact-contribution.client.ts";
import { ContactRoleClient } from "./contact-role.client.ts";
import { ContactTagClient } from "./contact-tag.client.ts";

import type { BaseClientOptions } from "../types/index.ts";
import type {
  ContactRoleData,
  CreateContactData,
  GetContactData,
  GetContactDataWith,
  GetContactsQuery,
  GetContactWith,
  Paginated,
  RuleGroup,
  Serial,
  UpdateContactData,
} from "../deps.ts";

export class ContactClient extends BaseClient {
  mfa: ContactMfaClient;
  contribution: ContactContributionClient;
  role: ContactRoleClient;
  tag: ContactTagClient;

  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/contact");
    super(options);
    this.mfa = new ContactMfaClient(options);
    this.contribution = new ContactContributionClient(options);
    this.role = new ContactRoleClient(options);
    this.tag = new ContactTagClient(options);
  }

  static deserialize<
    With extends GetContactWith | void = void,
  >(
    // TODO: fix type safety
    // deno-lint-ignore no-explicit-any
    contact: any, // Serial<GetContactDataWith<With>>,
  ): GetContactDataWith<With> {
    return {
      ...contact,
      displayName: `${contact.firstname} ${contact.lastname}`.trim() ||
        contact.email,
      joined: ContactClient.deserializeDate(contact.joined),
      lastSeen: ContactClient.deserializeDate(contact.lastSeen),
      ...(contact.contribution && {
        contribution: ContactContributionClient.deserialize(
          contact.contribution,
        ),
      }),
      ...(contact.roles && {
        roles: contact.roles.map((role: Serial<ContactRoleData>) =>
          ContactRoleClient.deserialize(role)
        ),
      }),
    };
  }

  async list<With extends GetContactWith | void = void>(
    query: GetContactsQuery,
    _with?: readonly With[],
  ): Promise<Paginated<GetContactDataWith<With>>> {
    // TODO: fix type safety
    // deno-lint-ignore no-explicit-any
    const { data } = await this.fetch.get<any>("/", {
      params: { with: _with, ...query },
    });
    return {
      ...data,
      items: data.items.map((item: Serial<GetContactData>) =>
        ContactClient.deserialize<With>(item)
      ),
    };
  }

  async create(newData: CreateContactData): Promise<GetContactData> {
    const { data } = await this.fetch.post("/", newData);
    return ContactClient.deserialize(data);
  }

  async get<With extends GetContactWith | void = void>(
    id: string,
    _with?: readonly With[],
  ): Promise<GetContactDataWith<With>> {
    const { data } = await this.fetch.get(`/${id}`, {
      params: { with: _with },
    });
    return ContactClient.deserialize<With>(data);
  }

  async update(
    id: string,
    updateData: UpdateContactData,
  ): Promise<GetContactData> {
    const { data } = await this.fetch.patch<Serial<GetContactData>>(
      `/${id}`,
      updateData,
    );
    return ContactClient.deserialize(data);
  }

  async updateMany(
    rules: RuleGroup,
    updates: UpdateContactData,
  ): Promise<{ affected: number }> {
    const { data } = await this.fetch.patch("/", {
      rules,
      updates,
    });
    return data;
  }

  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }
}
