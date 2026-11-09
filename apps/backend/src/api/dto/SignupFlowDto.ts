import { ConfirmSignupResult, NewsletterStatus } from '@beabee/beabee-common';

import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';

import { GetContactOriginDto } from '#api/dto/ContactOriginDto';
import { StartContributionDto } from '#api/dto/ContributionDto';
import IsPassword from '#api/validators/IsPassword';
import IsTrustedUrl from '#api/validators/IsTrustedUrl';
import IsVatNumber from '#api/validators/IsVatNumber';

import { CreatePaymentDto } from './PaymentDto.js';
import { CompletePaymentFlowDto } from './PaymentFlowDto.js';

export class StartSignupFlowDto {
  @IsOptional()
  @IsTrustedUrl()
  loginUrl?: string;

  @IsOptional()
  @IsTrustedUrl()
  setPasswordUrl?: string;

  @IsOptional()
  @IsTrustedUrl()
  confirmUrl?: string;

  @IsOptional()
  @IsTrustedUrl({ allowRelative: true })
  postConfirmUrl?: string;

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

  @IsOptional()
  @IsEnum(NewsletterStatus)
  newsletterStatus?: NewsletterStatus;

  @IsOptional()
  @IsString({ each: true })
  newsletterGroups?: string[];
}

export class ConfirmSignupResultDto implements ConfirmSignupResult {
  @IsOptional()
  @IsString()
  postConfirmUrl!: string | null;

  @IsOptional()
  @IsString()
  paymentClientSecret?: string;
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
