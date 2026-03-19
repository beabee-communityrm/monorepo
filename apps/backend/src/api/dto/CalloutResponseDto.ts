import {
  CalloutComponentSchema,
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
  CalloutResponseAnswersSlide,
  CalloutResponseGuestData,
  CalloutResponseNewsletterData,
  CalloutResponseViewSchema,
  CreateCalloutResponseData,
  GetCalloutResponseData,
  PaginatedQuery,
} from '@beabee/beabee-common';
import { GetCalloutResponseWith } from '@beabee/beabee-common';
import { Callout } from '@beabee/core/models';

import { Type } from 'class-transformer';
import {
  Allow,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  GetExportQuery,
  GetPaginatedQuery,
  GetPaginatedRuleGroup,
} from '#api/dto/BaseDto';
import { GetCalloutDto } from '#api/dto/CalloutDto';
import { GetCalloutResponseCommentDto } from '#api/dto/CalloutResponseCommentDto';
import { GetCalloutTagDto } from '#api/dto/CalloutTagDto';
import { GetContactDto } from '#api/dto/ContactDto';
import IsNonEmptyString from '#api/validators/IsNonEmptyString';

export interface BaseGetCalloutResponseOptsDto {
  callout?: Callout;
  isReviewer?: boolean;
}

export class GetCalloutResponseOptsDto {
  @IsOptional()
  @IsEnum(GetCalloutResponseWith, { each: true })
  with?: GetCalloutResponseWith[];
}

export class ListCalloutResponsesDto extends GetPaginatedQuery {
  @IsOptional()
  @IsEnum(GetCalloutResponseWith, { each: true })
  with?: GetCalloutResponseWith[];

  @IsIn(['number', 'createdAt', 'updatedAt'])
  sort?: string;

  @IsOptional()
  @Min(1)
  @Max(1000)
  limit?: number;
}

// TODO: this is a bit hacky
export interface GetCalloutResponseOptsDto
  extends BaseGetCalloutResponseOptsDto {}
export interface ListCalloutResponsesDto
  extends BaseGetCalloutResponseOptsDto {}

export class GetCalloutResponseDto implements GetCalloutResponseData {
  @IsString()
  id!: string;

  @IsNumber()
  number!: number;

  @IsDate()
  createdAt!: Date;

  @IsDate()
  updatedAt!: Date;

  @IsString()
  bucket!: string;

  @IsOptional()
  @IsString()
  guestName!: string | null;

  @IsOptional()
  @IsString()
  guestEmail!: string | null;

  // with[] answers
  @IsOptional()
  @IsObject()
  answers?: CalloutResponseAnswersSlide;

  // with[] callout
  @IsOptional()
  @ValidateNested()
  callout?: GetCalloutDto;

  // with[] contact
  @IsOptional()
  @ValidateNested()
  contact?: GetContactDto | null;

  // with[] tags
  @IsOptional()
  @ValidateNested({ each: true })
  tags?: GetCalloutTagDto[];

  // with[] assignee
  @IsOptional()
  @ValidateNested()
  assignee?: GetContactDto | null;

  // With latestComment
  @IsOptional()
  @ValidateNested()
  latestComment?: GetCalloutResponseCommentDto | null;
}

export class GetGuestCalloutResponseDto {
  @IsString()
  id!: string;
}

export class CreateCalloutResponseGuestDto implements CalloutResponseGuestData {
  @IsNonEmptyString()
  firstname!: string;

  @IsNonEmptyString()
  lastname!: string;

  @IsEmail()
  email!: string;
}

export class CreateCalloutResponseNewsletterDto
  implements CalloutResponseNewsletterData
{
  @IsBoolean()
  optIn!: boolean;

  @IsString({ each: true })
  groups!: string[];
}

export class CreateCalloutResponseDto implements CreateCalloutResponseData {
  // TODO: validate
  @IsObject()
  answers!: CalloutResponseAnswersSlide;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCalloutResponseGuestDto)
  guest?: CreateCalloutResponseGuestDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCalloutResponseNewsletterDto)
  newsletter?: CreateCalloutResponseNewsletterDto;

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsUUID('4')
  @IsOptional()
  assigneeId?: string | null;
}

export class UpdateCalloutResponseDto
  implements Partial<CreateCalloutResponseData>
{
  // TODO: validate
  @IsObject()
  @IsOptional()
  answers?: CalloutResponseAnswersSlide;

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsUUID('4')
  @IsOptional()
  assigneeId?: string | null;
}

export class BatchUpdateCalloutResponseDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GetPaginatedRuleGroup)
  rules!: GetPaginatedRuleGroup;

  @ValidateNested()
  @Type(() => CreateCalloutResponseDto)
  updates!: UpdateCalloutResponseDto;
}

export class BatchUpdateCalloutResponseResultDto {
  @IsNumber()
  affected!: number;
}

// Export types

export type ExportCalloutResponseDto = [
  createdAt: string,
  number: number,
  bucket: string,
  tags: string,
  assigneeEmail: string,
  firstname: string,
  lastname: string,
  fullname: string,
  email: string,
  isGuest: boolean,
  newsletterOptIn: true | '',
  newsletterGroups: string,
  comments: string,
  ...answers: string[],
];

export interface ExportCalloutResponsesOptsDto
  extends GetExportQuery,
    BaseGetCalloutResponseOptsDto {
  callout: Callout;
  components: (CalloutComponentSchema & { slideId: string })[];
}

// Get callout response map types

export class GetCalloutResponseMapDto {
  @IsNumber()
  number!: number;

  @IsObject()
  answers!: CalloutResponseAnswersSlide;

  @IsString()
  title!: string;

  @Allow()
  photos!: CalloutResponseAnswerFileUpload[];

  @IsOptional()
  @Allow()
  address?: CalloutResponseAnswerAddress;
}

export interface GetCalloutResponseMapOptsDto
  extends BaseGetCalloutResponseOptsDto {
  callout: Callout & { responseViewSchema: CalloutResponseViewSchema };
}

export type ListCalloutResponseMapDto = GetCalloutResponseMapOptsDto &
  PaginatedQuery;
