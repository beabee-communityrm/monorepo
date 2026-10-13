import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';

import { GetContactOriginDto } from '#api/dto/ContactOriginDto';
import { StartContributionDto } from '#api/dto/ContributionDto';
import IsPassword from '#api/validators/IsPassword';
import IsUrl from '#api/validators/IsUrl';
import IsVatNumber from '#api/validators/IsVatNumber';

import { CreatePaymentDto } from './PaymentDto.js';
import { CompletePaymentFlowDto } from './PaymentFlowDto.js';

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

export class CompleteSignupFlowDto extends CompletePaymentFlowDto {
  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsVatNumber()
  vatNumber?: string;
}
