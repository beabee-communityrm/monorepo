import { PaymentMethod } from '@beabee/beabee-common';
import type { JoinForm } from '@beabee/core/models';
import { CompleteUrls } from '@beabee/core/type';

import { StartContributionDto } from '@api/dto/ContributionDto';
import { CompleteJoinFlowDto, StartJoinFlowDto } from '@api/dto/JoinFlowDto';
import IsPassword from '@api/validators/IsPassword';
import IsUrl from '@api/validators/IsUrl';
import IsVatNumber from '@api/validators/IsVatNumber';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';

import { CreatePaymentDto } from './PaymentDto';

class StartSignupFlowContributionDto extends StartContributionDto {
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}

class StartSignupFlowOneTimePaymentDto extends CreatePaymentDto {
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}

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

  @Type(() => StartSignupFlowContributionDto)
  @ValidateNested()
  @IsOptional()
  contribution?: StartSignupFlowContributionDto;

  @Type(() => StartSignupFlowOneTimePaymentDto)
  @ValidateNested()
  @IsOptional()
  oneTimePayment?: StartSignupFlowOneTimePaymentDto;
}

export class CompleteSignupFlowDto
  extends CompleteJoinFlowDto
  implements Pick<JoinForm, 'firstname' | 'lastname' | 'vatNumber'>
{
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
