import { PaymentStatus } from '@beabee/beabee-common';

import { GetExportQuery, GetPaginatedQuery } from '@api/dto/BaseDto';
import { GetContactDto } from '@api/dto/ContactDto';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class GetPaymentDto {
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

export class GetPaymentAggregationOptsDto extends GetExportQuery {}

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

export class GetPaymentAggregationDto {
  @IsNumber()
  @IsOptional()
  sum!: number | null;

  @IsNumber()
  @IsOptional()
  average!: number | null;
}
