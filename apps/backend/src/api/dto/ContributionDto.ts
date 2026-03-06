import { ContributionPeriod, ContributionType } from '@beabee/beabee-common';

import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import IsUrl from '#api/validators/IsUrl';
import IsValidPayFee from '#api/validators/IsValidPayFee';
import MinContributionAmount from '#api/validators/MinContributionAmount';

import { PaymentFlowParamsDto } from './PaymentFlowDto';

export class UpdateContributionDto {
  @MinContributionAmount()
  amount!: number;

  @IsEnum(ContributionPeriod)
  period!: ContributionPeriod;

  @IsValidPayFee()
  payFee!: boolean;

  @IsBoolean()
  prorate!: boolean;
}

export class StartContributionDto extends UpdateContributionDto {
  // TODO: validate
  @IsObject()
  params!: PaymentFlowParamsDto;
}

export class ForceUpdateContributionDto {
  @IsIn([ContributionType.Manual, ContributionType.None])
  type!: ContributionType.Manual | ContributionType.None;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(ContributionPeriod)
  period?: ContributionPeriod;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
