import {
  PaymentFlowAdvanceParamsGoCardless,
  PaymentFlowAdvanceParamsStripe,
  PaymentFlowResult,
  PaymentFlowSetupParamsGoCardless,
  PaymentFlowSetupParamsStripe,
  PaymentMethod,
} from '@beabee/beabee-common';

import {
  Transform,
  TransformFnParams,
  plainToInstance,
} from 'class-transformer';
import { Equals, IsEnum, IsOptional, IsString } from 'class-validator';

import IsUrl from '#api/validators/IsUrl';

export class PaymentFlowResultDto implements PaymentFlowResult {
  @IsOptional()
  @IsString()
  redirectUrl?: string;
}

export class CompletePaymentFlowDto {
  @IsString()
  paymentFlowId!: string;
}

export class AdvancePaymentFlowDto {
  @IsString()
  paymentFlowId!: string;

  @Transform(transformPaymentFlowAdvanceParams)
  advanceParams!: PaymentFlowAdvanceParamsDto;
}

class PaymentFlowParamsGoCardlessDto
  implements PaymentFlowSetupParamsGoCardless
{
  @Equals(PaymentMethod.GoCardlessDirectDebit)
  paymentMethod!: PaymentMethod.GoCardlessDirectDebit;

  @IsUrl()
  completeUrl!: string;
}

class PaymentFlowParamsStripeDto implements PaymentFlowSetupParamsStripe {
  @IsEnum([
    PaymentMethod.StripeCard,
    PaymentMethod.StripeBACS,
    PaymentMethod.StripeSEPA,
    PaymentMethod.StripePayPal,
    PaymentMethod.StripeIdeal,
  ])
  paymentMethod!:
    | PaymentMethod.StripeCard
    | PaymentMethod.StripeBACS
    | PaymentMethod.StripeSEPA
    | PaymentMethod.StripePayPal
    | PaymentMethod.StripeIdeal;
}

class PaymentFlowAdvanceParamsGoCardlessDto
  implements PaymentFlowAdvanceParamsGoCardless
{
  @IsString()
  paymentFlowId!: string;
}

class PaymentFlowAdvanceParamsStripeDto
  implements PaymentFlowAdvanceParamsStripe
{
  @IsString()
  paymentFlowId!: string;

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

export type PaymentFlowParamsDto =
  | PaymentFlowParamsGoCardlessDto
  | PaymentFlowParamsStripeDto;

export function transformPaymentFlowParams(
  params: TransformFnParams
): PaymentFlowParamsDto {
  return plainToInstance<PaymentFlowParamsDto, unknown>(
    params.value.paymentMethod === PaymentMethod.GoCardlessDirectDebit
      ? PaymentFlowParamsGoCardlessDto
      : PaymentFlowParamsStripeDto,
    params.value
  );
}
