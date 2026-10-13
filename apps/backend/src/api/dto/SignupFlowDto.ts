import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsUUID,
  Validate,
  ValidateNested,
} from 'class-validator';

import { GetContactOriginDto } from '#api/dto/ContactOriginDto';
import { StartContributionDto } from '#api/dto/ContributionDto';
import IsPassword from '#api/validators/IsPassword';
import IsUrl from '#api/validators/IsUrl';

import { CreatePaymentDto } from './PaymentDto.js';
import { PaymentFlowAdvanceParamsDto } from './PaymentFlowDto.js';

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

  @Type(() => GetContactOriginDto)
  @ValidateNested()
  @IsOptional()
  origin?: GetContactOriginDto;
}

export class AdvanceSignupFlowDto {
  @IsUUID('4')
  paymentFlowId!: string;

  @Type(() => PaymentFlowAdvanceParamsDto)
  @ValidateNested()
  params!: PaymentFlowAdvanceParamsDto;
}

export class SignupCompleteDto {
  @IsUUID('4')
  id!: string;
}
