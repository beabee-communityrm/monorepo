import type {
  ContactRoleData,
  CreateContactData,
  GetContactData,
  GetContactDataWith,
  GetContactWith,
  GetContactsQuery,
  Paginated,
  RuleGroup,
  Serial,
  UpdateContactData,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';
import { ContactContributionClient } from './contact-contribution.client.js';
import { ContactMfaClient } from './contact-mfa.client.js';
import { ContactPaymentMethodClient } from './contact-payment-method.client.js';
import { ContactPaymentClient } from './contact-payment.client.js';
import { ContactRoleClient } from './contact-role.client.js';
import { ContactTagClient } from './contact-tag.client.js';

/**
 * Client for managing contacts (users) in the Beabee system
 * Provides comprehensive contact management including roles, contributions, MFA, and tags
 * @extends BaseClient
 */
export class ContactClient extends BaseClient {
  /** Client for managing multi-factor authentication */
  readonly mfa: ContactMfaClient;

  /** Client for managing contact contributions */
  readonly contribution: ContactContributionClient;

  /** Client for managing contact roles */
  readonly role: ContactRoleClient;

  /** Client for managing contact tags */
  readonly tag: ContactTagClient;

  /** Client for managing contact payments */
  readonly payment: ContactPaymentClient;

  /** Client for managing contact payment methods */
  readonly paymentMethod: ContactPaymentMethodClient;

  /**
   * Creates a new contact client with all sub-clients
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/contact'),
    });
    this.mfa = new ContactMfaClient(options);
    this.contribution = new ContactContributionClient(options);
    this.role = new ContactRoleClient(options);
    this.tag = new ContactTagClient(options);
    this.payment = new ContactPaymentClient(options);
    this.paymentMethod = new ContactPaymentMethodClient(options);
  }

  /**
   * Deserializes contact data from the server response
   * Handles dates, nested objects, and computes display name
   * @param contact - The serialized contact data
   * @returns Deserialized contact with computed fields
   */
  static deserialize<With extends GetContactWith | void = void>(
    // TODO: fix type safety
    contact: any // Serial<GetContactDataWith<With>>,
  ): GetContactDataWith<With> {
    return {
      ...contact,
      displayName:
        `${contact.firstname} ${contact.lastname}`.trim() || contact.email,
      joined: ContactClient.deserializeDate(contact.joined),
      lastSeen: ContactClient.deserializeDate(contact.lastSeen),
      ...(contact.contribution && {
        contribution: ContactContributionClient.deserialize(
          contact.contribution
        ),
      }),
      ...(contact.roles && {
        roles: contact.roles.map((role: Serial<ContactRoleData>) =>
          ContactRoleClient.deserialize(role)
        ),
      }),
    };
  }

  /**
   * Lists contacts with optional filtering and relations
   * @param query - Query parameters for filtering contacts
   * @param _with - Optional relations to include
   * @returns Paginated list of contacts
   */
  async list<With extends GetContactWith | void = void>(
    query: GetContactsQuery = {},
    _with?: readonly With[]
  ): Promise<Paginated<GetContactDataWith<With>>> {
    const { data } = await this.fetch.get<Paginated<Serial<GetContactData>>>(
      '/',
      { with: _with, ...query }
    );
    return {
      ...data,
      items: data.items.map((item: Serial<GetContactData>) =>
        ContactClient.deserialize<With>(item)
      ),
    };
  }

  /**
   * Creates a new contact
   * @param newData - The contact data to create
   * @returns The created contact
   */
  async create(newData: CreateContactData): Promise<GetContactData> {
    const { data } = await this.fetch.post('/', newData);
    return ContactClient.deserialize(data);
  }

  /**
   * Gets a single contact by ID
   * @param id - The contact ID
   * @param _with - Optional relations to include
   * @returns The contact data with requested relations
   */
  async get<With extends GetContactWith | void = void>(
    id: string,
    _with?: readonly With[]
  ): Promise<GetContactDataWith<With>> {
    const { data } = await this.fetch.get(`/${id}`, { with: _with });
    return ContactClient.deserialize<With>(data);
  }

  /**
   * Updates a contact's information
   * @param id - The contact ID
   * @param updateData - The data to update
   * @returns The updated contact
   */
  async update(
    id: string,
    updateData: UpdateContactData
  ): Promise<GetContactData> {
    const { data } = await this.fetch.patch<Serial<GetContactData>>(
      `/${id}`,
      updateData
    );
    return ContactClient.deserialize(data);
  }

  /**
   * Updates multiple contacts based on rules
   * @param rules - Rules to select which contacts to update
   * @param updates - The update data to apply
   * @returns Number of affected contacts
   */
  async updateMany(
    rules: RuleGroup,
    updates: UpdateContactData
  ): Promise<{ affected: number }> {
    const { data } = await this.fetch.patch('/', {
      rules,
      updates,
    });
    return data;
  }

  /**
   * Deletes a contact
   * @param id - The contact ID to delete
   */
  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }
}
