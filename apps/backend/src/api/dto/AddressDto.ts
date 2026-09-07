import { Address } from '@beabee/beabee-common';

import { IsDefined, IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto implements Address {
  @IsDefined()
  @IsString()
  line1!: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsDefined()
  @IsString()
  city!: string;

  @IsDefined()
  @IsString()
  postcode!: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class GetAddressDto extends UpdateAddressDto {}
