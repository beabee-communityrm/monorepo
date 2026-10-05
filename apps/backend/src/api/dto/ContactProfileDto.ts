import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { GetAddressDto, UpdateAddressDto } from '#api/dto/AddressDto';

export class GetContactProfileDto {
  @IsString()
  telephone!: string;

  @IsString()
  twitter!: string;

  @IsString()
  organisation!: string;

  @IsString()
  vatNumber!: string;

  @IsString()
  preferredContact!: string;

  @IsBoolean()
  deliveryOptIn!: boolean;

  @IsOptional()
  @ValidateNested()
  deliveryAddress!: GetAddressDto | null;

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
  organisation?: string;

  @IsOptional()
  @IsString()
  vatNumber?: string;

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

  // Admin only
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
