import {
  PaymentFlowAdvanceParamsGoCardless,
  PaymentFlowAdvanceParamsStripe,
  PaymentFlowSetupParams,
  PaymentFlowSetupResult,
  PaymentMethod,
} from '@beabee/beabee-common';

import {
  Transform,
  TransformFnParams,
  plainToInstance,
} from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import IsUrl from '#api/validators/IsUrl';

export class CompletePaymentFlowDto {
  @IsUUID('4')
  paymentFlowId!: string;

  @IsOptional()
  @ValidateNested()
  @Transform(transformPaymentFlowAdvanceParams)
  params?: PaymentFlowAdvanceParamsDto;
}

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

class PaymentFlowAdvanceParamsGoCardlessDto
  implements PaymentFlowAdvanceParamsGoCardless {}

class PaymentFlowAdvanceParamsStripeDto
  implements PaymentFlowAdvanceParamsStripe
{
  @IsString()
  token!: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  vatNumber?: string;
}

export type PaymentFlowAdvanceParamsDto =
  | PaymentFlowAdvanceParamsGoCardlessDto
  | PaymentFlowAdvanceParamsStripeDto;

export function transformPaymentFlowAdvanceParams(
  params: TransformFnParams
): PaymentFlowAdvanceParamsDto {
  return plainToInstance<PaymentFlowAdvanceParamsDto, unknown>(
    params.value.paymentMethod === PaymentMethod.GoCardlessDirectDebit
      ? PaymentFlowAdvanceParamsGoCardlessDto
      : PaymentFlowAdvanceParamsStripeDto,
    params.value
  );
}
