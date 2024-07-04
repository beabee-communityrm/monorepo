import { RoleType } from "@beabee/beabee-common";
import type ApiKey from "@beabee/beabee-core/models/ApiKey";
import Contact from "@beabee/beabee-core/models/Contact";

export interface AuthInfo {
  method: "user" | "api-key";
  entity: Contact | ApiKey;
  roles: RoleType[];
}
