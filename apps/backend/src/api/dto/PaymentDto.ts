import { PaymentStatus, PaymentType } from '@beabee/beabee-common';

import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { GetExportQuery, GetPaginatedQuery } from '#api/dto/BaseDto';
import { GetContactDto } from '#api/dto/ContactDto';
import {
  PaymentFlowParamsDto,
  transformPaymentFlowParams,
} from '#api/dto/PaymentFlowDto';

export class CreatePaymentDto {
  @Min(1)
  amount!: number;

  @IsBoolean()
  payFee!: boolean;

  @Transform(transformPaymentFlowParams)
  @ValidateNested()
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

export interface ExportPaymentDto {
  Id: string;
  Amount: number;
  ChargeDate: string;
  Status: PaymentStatus;
  Type: PaymentType;
  SubscriptionId: string;
  ContactId: string;
  ContactEmail: string;
  ContactFirstName: string;
  ContactLastName: string;
}

export class UpdatePaymentMethodDto {
  @Transform(transformPaymentFlowParams)
  @ValidateNested()
  params!: PaymentFlowParamsDto;
}
