import { PaymentStatus, PaymentType } from '@beabee/beabee-common';

import { GetExportQuery, GetPaginatedQuery } from '@api/dto/BaseDto';
import { GetContactDto } from '@api/dto/ContactDto';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { PaymentFlowParamsDto } from './PaymentFlowDto';

export class CreatePaymentDto {
  @Min(1)
  amount!: number;

  @IsBoolean()
  payFee!: boolean;

  // TODO: validate
  @IsObject()
  params!: PaymentFlowParamsDto;
}

export class GetPaymentDto {
  @IsString()
  id!: string;

  @IsNumber()
  amount!: number;

  @IsDate()
  chargeDate!: Date;

  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @IsEnum(PaymentType)
  type!: PaymentType;

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
