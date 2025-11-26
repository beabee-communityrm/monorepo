import type { JoinForm } from '@beabee/core/models';
import { CompleteUrls } from '@beabee/core/type';

import { StartContributionDto } from '@api/dto/ContributionDto';
import { CompleteJoinFlowDto } from '@api/dto/JoinFlowDto';
import { CreateOneTimePaymentDto } from '@api/dto/OneTimePaymentDto';
import IsPassword from '@api/validators/IsPassword';
import IsUrl from '@api/validators/IsUrl';
import IsVatNumber from '@api/validators/IsVatNumber';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';

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

  @Type(() => CreateOneTimePaymentDto)
  @ValidateNested()
  @IsOptional()
  oneTimePayment?: CreateOneTimePaymentDto;
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
