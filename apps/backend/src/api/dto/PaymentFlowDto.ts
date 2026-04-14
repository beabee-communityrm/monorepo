import {
  PaymentFlowAdvanceParams,
  PaymentFlowSetupParams,
  PaymentFlowSetupResult,
  PaymentMethod,
} from '@beabee/beabee-common';

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import IsUrl from '#api/validators/IsUrl';

export class PaymentFlowSetupParamsDto implements PaymentFlowSetupParams {
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsUrl()
  completeUrl!: string;
}

export class PaymentFlowSetupResultDto implements PaymentFlowSetupResult {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;
}

export class PaymentFlowAdvanceParamsDto implements PaymentFlowAdvanceParams {
  @IsString()
  @IsOptional()
  token?: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsString()
  @IsOptional()
  vatNumber?: string;
}

export class CompletePaymentFlowDto {
  @IsUUID('4')
  paymentFlowId!: string;

  @IsOptional()
  @Type(() => PaymentFlowAdvanceParamsDto)
  @ValidateNested()
  params?: PaymentFlowAdvanceParamsDto;
}
