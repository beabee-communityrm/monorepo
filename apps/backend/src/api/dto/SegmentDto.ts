import { GetPaginatedQuery, GetPaginatedRuleGroup } from '@api/dto/BaseDto';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum GetSegmentWith {
  itemCount = 'itemCount',
}

export class CreateSegmentDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @ValidateNested()
  @Type(() => GetPaginatedRuleGroup)
  ruleGroup!: GetPaginatedRuleGroup;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class GetSegmentDto extends CreateSegmentDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsNumber()
  itemCount?: number;
}

export class GetSegmentOptsDto {
  @IsOptional()
  @IsEnum(GetSegmentWith, { each: true })
  with?: GetSegmentWith[];
}

export class ListSegmentsDto extends GetPaginatedQuery {
  @IsOptional()
  @IsEnum(GetSegmentWith, { each: true })
  with?: GetSegmentWith[];

  @IsOptional()
  @IsIn(['name', 'description', 'order'])
  sort?: string;
}

/** Body for POST /segments/:id/email/send (one-off email to all segment contacts). */
export class SendSegmentEmailBodyDto {
  /** When set, use this saved template (subject/body ignored) and create an EmailMailing for tracking. */
  @IsOptional()
  @IsString()
  emailId?: string;

  @IsString()
  subject!: string;

  @IsString()
  body!: string;
}
