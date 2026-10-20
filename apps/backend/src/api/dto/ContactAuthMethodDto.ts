import {
  CONTACT_AUTH_METHOD_TYPES,
  ContactAuthMethodType,
  GetContactAuthMethodData,
} from '@beabee/beabee-common';

import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetContactAuthMethodDto implements GetContactAuthMethodData {
  @IsString()
  id!: string;

  @IsIn(CONTACT_AUTH_METHOD_TYPES)
  type!: ContactAuthMethodType;

  @IsOptional()
  @IsString()
  name?: string;
}
