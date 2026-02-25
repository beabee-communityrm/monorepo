import { CompleteUrls } from '@beabee/core/type';

import { StartContributionDto } from '@api/dto/ContributionDto';
import { CompletePaymentFlowDto } from '@api/dto/PaymentFlowDto';
import IsPassword from '@api/validators/IsPassword';
import IsUrl from '@api/validators/IsUrl';
import IsVatNumber from '@api/validators/IsVatNumber';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, Validate, ValidateNested } from 'class-validator';

import { CreatePaymentDto } from './PaymentDto';

export class StartSignupFlowDto implements CompleteUrls {
  @IsUrl()
  loginUrl!: string;

  @IsUrl()
  setPasswordUrl!: string;

  @IsUrl()
  confirmUrl!: string;

  @IsEmail()
  email!: string;

  @Validate(IsPassword)
  @IsOptional()
  password?: string;

  @Type(() => StartContributionDto)
  @ValidateNested()
  @IsOptional()
  contribution?: StartContributionDto;

  @Type(() => CreatePaymentDto)
  @ValidateNested()
  @IsOptional()
  oneTimePayment?: CreatePaymentDto;
}

export class CompleteSignupFlowDto extends CompletePaymentFlowDto {
  @IsOptional()
  @IsVatNumber()
  vatNumber?: string;
}
