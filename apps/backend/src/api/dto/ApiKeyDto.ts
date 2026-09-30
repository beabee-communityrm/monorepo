import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { GetPaginatedQuery } from '#api/dto/BaseDto';
import { GetContactDto } from '#api/dto/ContactDto';

export class CreateApiKeyDto {
  @IsString()
  description!: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expires!: Date | null;

  @IsOptional()
  @IsUUID()
  contactId?: string;
}

export class NewApiKeyDto {
  @IsString()
  token!: string;
}

export class GetApiKeyDto extends CreateApiKeyDto {
  @IsString()
  id!: string;

  @ValidateNested()
  creator!: GetContactDto;

  @IsDate()
  createdAt!: Date;
}

export class ListApiKeysDto extends GetPaginatedQuery {
  @IsIn(['createdAt', 'expires'])
  sort?: string;
}
