import { RoleType } from "@beabee/beabee-common";
import type { ApiKey, Contact } from "@beabee/models";

export interface AuthInfo {
  method: "user" | "api-key";
  entity: Contact | ApiKey;
  roles: RoleType[];
}
