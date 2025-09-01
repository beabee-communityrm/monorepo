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
  itemCount = 'itemCount',
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
  itemCount?: number;
}

export class GetCalloutResponseSegmentOptsDto {
  @IsOptional()
  @IsEnum(GetCalloutResponseSegmentWith, { each: true })
  with?: GetCalloutResponseSegmentWith[];
}

// class-validator won't accept a `calloutId`, but the controller can still add it
export interface GetCalloutResponseSegmentOptsDto {
  calloutId: string;

  withGlobalSegments?: boolean;
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

  @IsOptional()
  @IsString()
  withGlobalSegments?: boolean;
}
