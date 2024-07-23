import { RoleType } from "@beabee/beabee-common";
import type { Contact } from "@beabee/core/models";

interface AuthInfoContact {
  method: "user";
  contact: Contact;
  roles: RoleType[];
}

interface AuthInfoApiKey {
  method: "api-key";
  contact?: Contact;
  roles: RoleType[];
}

interface AuthInfoInternal {
  method: "internal";
  contact: undefined;
  roles: RoleType[];
}

export type AuthInfo = AuthInfoContact | AuthInfoApiKey | AuthInfoInternal;
