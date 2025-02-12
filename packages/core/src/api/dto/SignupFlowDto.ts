import { Type } from "class-transformer";
import {
  IsEmail,
  Validate,
  ValidateNested,
  IsOptional,
  IsString
} from "class-validator";

import { StartContributionDto } from "../dto/ContributionDto";
import { CompleteJoinFlowDto } from "../dto/JoinFlowDto";
import IsPassword from "../validators/IsPassword";
import IsUrl from "../validators/IsUrl";

import type { JoinForm } from "@beabee/core/models";

import { CompleteUrls } from "@beabee/core/type";
import IsVatNumber from "../validators/IsVatNumber";

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
}

export class CompleteSignupFlowDto
  extends CompleteJoinFlowDto
  implements Pick<JoinForm, "firstname" | "lastname" | "vatNumber">
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
