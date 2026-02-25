import {
  PaymentFlowParams,
  PaymentFlowParamsGoCardless,
  PaymentFlowParamsStripe,
  PaymentFlowResultGoCardless,
  PaymentFlowResultNone,
  PaymentFlowResultStripe,
  PaymentMethod,
} from '@beabee/beabee-common';

import { plainToInstance } from 'class-transformer';
import { Equals, IsEnum, IsOptional, IsString } from 'class-validator';

class PaymentFlowResultGoCardlessDto implements PaymentFlowResultGoCardless {
  @Equals('gocardless')
  type!: 'gocardless';

  @IsString()
  redirectUrl!: string;
}

class PaymentFlowResultStripeDto implements PaymentFlowResultStripe {
  @Equals('stripe')
  type!: 'stripe';

  @IsOptional()
  @IsString()
  clientSecret?: string;
}

class PaymentFlowResultNoneDto implements PaymentFlowResultNone {
  @Equals('none')
  type!: 'none';
}

export type PaymentFlowResultDto =
  | PaymentFlowResultGoCardlessDto
  | PaymentFlowResultStripeDto
  | PaymentFlowResultNoneDto;

export function plainPaymentFlowResultToDto(
  result:
    | PaymentFlowResultGoCardless
    | PaymentFlowResultStripe
    | PaymentFlowResultNone
): PaymentFlowResultDto {
  switch (result.type) {
    case 'gocardless':
      return plainToInstance(PaymentFlowResultGoCardlessDto, result);
    case 'stripe':
      return plainToInstance(PaymentFlowResultStripeDto, result);
    case 'none':
      return plainToInstance(PaymentFlowResultNoneDto, result);
  }
}

class PaymentFlowParamsGoCardlessDto implements PaymentFlowParamsGoCardless {
  @Equals(PaymentMethod.GoCardlessDirectDebit)
  paymentMethod!: PaymentMethod.GoCardlessDirectDebit;

  @IsString()
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

export class CompletePaymentFlowDto {
  @IsString()
  paymentFlowId!: string;
}
