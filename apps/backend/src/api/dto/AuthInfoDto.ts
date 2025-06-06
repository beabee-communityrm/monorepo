import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GetContactDto } from './ContactDto';
import { RoleType } from '@beabee/beabee-common';

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
}
