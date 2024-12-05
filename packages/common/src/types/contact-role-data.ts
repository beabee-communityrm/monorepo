import type { RoleType, UpdateContactRoleData } from "./index.js";

export interface ContactRoleData extends UpdateContactRoleData {
  role: RoleType;
}
