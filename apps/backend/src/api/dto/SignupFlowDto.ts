import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

import { StartContributionDto } from '#api/dto/ContributionDto';
import IsUrl from '#api/validators/IsUrl';
import IsVatNumber from '#api/validators/IsVatNumber';

import { CreatePaymentDto } from './PaymentDto.js';
import { CompletePaymentFlowDto } from './PaymentFlowDto.js';

export class StartSignupFlowDto {
  @IsUrl()
  loginUrl!: string;

  @IsUrl()
  confirmUrl!: string;

  @IsEmail()
  email!: string;

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
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsVatNumber()
  vatNumber?: string;
}
