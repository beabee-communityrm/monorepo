import type { RoleType, UpdateContactRoleData } from "./index.ts";

export interface ContactRoleData extends UpdateContactRoleData {
  role: RoleType;
}
