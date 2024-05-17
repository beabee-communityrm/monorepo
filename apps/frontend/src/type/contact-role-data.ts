import type { RoleType } from '@beabee/beabee-common';
import type { UpdateContactRoleData } from '@type';

export interface ContactRoleData extends UpdateContactRoleData {
  role: RoleType;
}
