import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import type { BaseClientOptions } from "../types/index.js";

import type {
  ContactRoleData,
  RoleType,
  Serial,
  UpdateContactRoleData
} from "@beabee/beabee-common";

export class ContactRoleClient extends BaseClient {
  static deserialize(data: Serial<ContactRoleData>): ContactRoleData {
    return {
      role: data.role,
      dateAdded: this.deserializeDate(data.dateAdded),
      dateExpires: data.dateExpires
        ? this.deserializeDate(data.dateExpires)
        : null
    };
  }

  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + "/contact")
    });
  }

  // Role methods
  async update(
    id: string,
    role: RoleType,
    updateData: UpdateContactRoleData
  ): Promise<ContactRoleData> {
    const { data } = await this.fetch.put(`/${id}/role/${role}`, {
      dateAdded: updateData.dateAdded,
      dateExpires: updateData.dateExpires
    });
    return ContactRoleClient.deserialize(data);
  }

  async delete(id: string, role: RoleType): Promise<void> {
    await this.fetch.delete(`/${id}/role/${role}`);
  }
}
