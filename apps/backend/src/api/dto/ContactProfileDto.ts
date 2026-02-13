import { NewsletterStatus } from '@beabee/beabee-common';

import { GetAddressDto, UpdateAddressDto } from '#api/dto/AddressDto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetContactProfileDto {
  @IsString()
  telephone!: string;

  @IsString()
  twitter!: string;

  @IsString()
  preferredContact!: string;

  @IsBoolean()
  deliveryOptIn!: boolean;

  @IsOptional()
  @ValidateNested()
  deliveryAddress!: GetAddressDto | null;

  @IsEnum(NewsletterStatus)
  newsletterStatus!: NewsletterStatus;

  @IsArray()
  @IsString({ each: true })
  newsletterGroups!: string[];

  @IsString({ groups: ['admin'] })
  notes?: string;

  @IsString({ groups: ['admin'] })
  description?: string;
}

export class UpdateContactProfileDto implements Partial<GetContactProfileDto> {
  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  preferredContact?: string;

  @IsOptional()
  @IsBoolean()
  deliveryOptIn?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  deliveryAddress?: UpdateAddressDto;

  @IsOptional()
  @IsEnum(NewsletterStatus)
  newsletterStatus?: NewsletterStatus;

  @IsOptional()
  @IsString({ each: true })
  newsletterGroups?: string[];

  // Admin only
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
