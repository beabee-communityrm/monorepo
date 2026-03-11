import {
  PaymentFlowParamsGoCardless,
  PaymentFlowParamsStripe,
  PaymentFlowResult,
  PaymentMethod,
} from '@beabee/beabee-common';

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

class PaymentFlowParamsGoCardlessDto implements PaymentFlowParamsGoCardless {
  @Equals(PaymentMethod.GoCardlessDirectDebit)
  paymentMethod!: PaymentMethod.GoCardlessDirectDebit;

  @IsUrl()
  completeUrl!: string;
}

class PaymentFlowParamsStripeDto implements PaymentFlowParamsStripe {
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

export type PaymentFlowParamsDto =
  | PaymentFlowParamsGoCardlessDto
  | PaymentFlowParamsStripeDto;
