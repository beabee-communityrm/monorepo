import { PaymentMethod } from '@beabee/beabee-common';

import { IsEnum, IsOptional, IsString } from 'class-validator';

import IsUrl from '#api/validators/IsUrl';

export class StartJoinFlowDto {
  @IsUrl()
  completeUrl!: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;
}

export class CompleteJoinFlowDto {
  @IsString()
  paymentFlowId!: string;
}
