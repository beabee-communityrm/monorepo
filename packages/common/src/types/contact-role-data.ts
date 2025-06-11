import type { RoleType, UpdateContactRoleData } from './index.js';

export interface ContactRoleData extends UpdateContactRoleData {
  dateAdded: Date;
  role: RoleType;
}
