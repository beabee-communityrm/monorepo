import { Type } from 'class-transformer';
import { IsEmail, IsOptional, Validate, ValidateNested } from 'class-validator';

import { StartContributionDto } from '#api/dto/ContributionDto';
import IsPassword from '#api/validators/IsPassword';
import IsUrl from '#api/validators/IsUrl';

import { CreatePaymentDto } from './PaymentDto';

export class StartSignupFlowDto {
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
