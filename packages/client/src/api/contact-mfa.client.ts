import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";

import type { BaseClientOptions } from "../types/index.js";
import type {
  CreateContactMfaData,
  DeleteContactMfaData,
  GetContactMfaData,
  Serial
} from "../deps.js";

/**
 * Client for managing contact MFA operations.
 */
export class ContactMfaClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/contact");
    super(options);
  }

  /**
   * Deserialize MFA data.
   * @param data - The serialized MFA data.
   * @returns The deserialized MFA data.
   */
  protected deserialize(data: Serial<GetContactMfaData>): GetContactMfaData {
    // Nothing to do for now
    return data;
  }

  /**
   * Fetch the MFA data for a specific contact.
   * @param contactId - The ID of the contact.
   * @returns A promise that resolves to the contact's MFA data.
   */
  async get(contactId: string): Promise<GetContactMfaData> {
    const { data } = await this.fetch.get<Serial<GetContactMfaData>>(
      `/${contactId}/mfa`
    );
    return this.deserialize(data);
  }

  /**
   * Create a new MFA entry for a contact.
   * @param contactId - The ID of the contact.
   * @param newData - The data required to create the MFA.
   * @returns A promise that resolves when the MFA is created.
   */
  async create(
    contactId: string,
    newData: CreateContactMfaData
  ): Promise<void> {
    await this.fetch.post<undefined>(`/${contactId}/mfa`, newData);
  }

  /**
   * Delete an MFA entry for a contact.
   * @param contactId - The ID of the contact.
   * @param deleteData - The data required to delete the MFA.
   * @returns A promise that resolves when the MFA is deleted.
   */
  async delete(
    contactId: string,
    deleteData: DeleteContactMfaData
  ): Promise<void> {
    await this.fetch.delete(`/${contactId}/mfa`, { data: deleteData });
  }
}
