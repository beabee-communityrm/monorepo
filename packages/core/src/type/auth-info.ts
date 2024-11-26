import { RoleType } from "@beabee/beabee-common";
import type { Contact } from "#models";

interface AuthInfoNone {
  method: "none";
  contact?: undefined;
  roles: RoleType[]; // Should be empty
}

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
  contact?: undefined;
  roles: RoleType[];
}

export type AuthInfo =
  | AuthInfoNone
  | AuthInfoContact
  | AuthInfoApiKey
  | AuthInfoInternal;
