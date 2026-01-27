import { PaymentStatus } from '@beabee/beabee-common';

import { GetPaginatedQuery } from '@api/dto/BaseDto';
import { GetContactDto } from '@api/dto/ContactDto';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetPaymentDto {
  @IsString()
  id!: string;

  @IsNumber()
  amount!: number;

  @IsDate()
  chargeDate!: Date;

  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @IsOptional()
  @ValidateNested()
  contact?: GetContactDto | null;
}

export enum GetPaymentWith {
  Contact = 'contact',
}

export class GetPaymentOptsDto {
  @IsArray()
  @IsOptional()
  @IsEnum(GetPaymentWith, { each: true })
  with?: GetPaymentWith[];
}

export class ListPaymentsDto extends GetPaginatedQuery {
  @IsArray()
  @IsOptional()
  @IsEnum(GetPaymentWith, { each: true })
  with?: GetPaymentWith[];

  @IsIn(['amount', 'chargeDate'])
  sort?: string;
}
