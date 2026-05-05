import type { RoleType } from '@beabee/beabee-common';
import { RoleTypes } from '@beabee/beabee-common';

import { IsIn, IsUUID } from 'class-validator';

export class ContactRoleParams {
  @IsUUID('4')
  id!: string;

  @IsIn(RoleTypes)
  roleType!: RoleType;
}
