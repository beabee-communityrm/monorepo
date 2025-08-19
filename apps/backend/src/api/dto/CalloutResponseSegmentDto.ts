import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { GetPaginatedQuery, GetPaginatedRuleGroup } from './BaseDto';

export enum GetCalloutResponseSegmentWith {
  calloutResponseCount = 'calloutResponseCount',
}

export class CreateCalloutResponseSegmentDto {
  @IsString()
  name!: string;

  @ValidateNested()
  @Type(() => GetPaginatedRuleGroup)
  ruleGroup!: GetPaginatedRuleGroup;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class GetCalloutResponseSegmentDto extends CreateCalloutResponseSegmentDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsNumber()
  calloutResponseCount?: number;
}

export class GetCalloutResponseSegmentOptsDto {
  @IsOptional()
  @IsEnum(GetCalloutResponseSegmentWith, { each: true })
  with?: GetCalloutResponseSegmentWith[];

  @IsOptional()
  @IsString()
  calloutId!: string;
}

export class ListCalloutResponseSegmentsDto extends GetPaginatedQuery {
  @IsOptional()
  @IsEnum(GetCalloutResponseSegmentWith, { each: true })
  with?: GetCalloutResponseSegmentWith[];

  @IsOptional()
  @IsIn(['name', 'order'])
  sort?: string;

  @IsOptional()
  @IsString()
  calloutId!: string;
}
