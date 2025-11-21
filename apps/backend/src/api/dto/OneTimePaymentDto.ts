import { PaymentMethod } from '@beabee/beabee-common';

import { StartJoinFlowDto } from '@api/dto/JoinFlowDto';
import { IsBoolean, IsEnum, Min } from 'class-validator';

export class CreateOneTimePaymentDto extends StartJoinFlowDto {
  @Min(1)
  amount!: number;

  @IsBoolean()
  payFee!: boolean;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
