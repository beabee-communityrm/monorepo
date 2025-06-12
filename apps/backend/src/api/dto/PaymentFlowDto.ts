import { PaymentFlowParams } from '@beabee/core/type';

import { IsOptional, IsString } from 'class-validator';

export class GetPaymentFlowDto implements PaymentFlowParams {
  @IsOptional()
  @IsString()
  clientSecret?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;
}
