import { PaymentMethod, PaymentStatus } from '@beabee/beabee-common';

import { GetPaginatedQuery } from '@api/dto/BaseDto';
import { GetContactDto } from '@api/dto/ContactDto';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

import { StartJoinFlowDto } from './JoinFlowDto';

export class CreatePaymentDto extends StartJoinFlowDto {
  @Min(1)
  amount!: number;

  @IsBoolean()
  payFee!: boolean;
}

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
