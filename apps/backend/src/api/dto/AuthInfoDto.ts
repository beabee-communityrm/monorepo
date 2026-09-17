import { AuthInfoSelfServiceData, RoleType } from '@beabee/beabee-common';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { GetContactDto } from './ContactDto.js';

/**
 * DTO for authentication information response
 * Contains user contact data and roles
 */
export class GetAuthInfoDto {
  @IsIn(['none', 'user', 'api-key', 'internal'])
  method!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GetContactDto)
  contact?: GetContactDto | undefined;

  @IsArray()
  @IsString({ each: true })
  roles!: RoleType[];

  @IsOptional()
  @IsObject()
  selfService?: AuthInfoSelfServiceData;
}
