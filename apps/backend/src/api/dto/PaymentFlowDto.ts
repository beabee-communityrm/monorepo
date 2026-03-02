import { PaymentFlowResult, PaymentMethod } from '@beabee/beabee-common';

import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class PaymentFlowResultDto implements PaymentFlowResult {
  @IsOptional()
  @IsString()
  clientSecret?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;
}

export class StartPaymentFlowDto {
  @IsUrl()
  completeUrl!: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;
}

export class CompletePaymentFlowDto {
  @IsString()
  paymentFlowId!: string;
}
