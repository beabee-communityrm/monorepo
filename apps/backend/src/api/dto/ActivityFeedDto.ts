import {
  ActivityActorType,
  ActivityEventMetadata,
  ActivityEventType,
  GetActivityEventWith,
} from '@beabee/beabee-common';

import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { GetPaginatedQuery } from '#api/dto/BaseDto';

export class ActivityEventReferenceDto {
  @IsString()
  type!: string;

  @IsString()
  id!: string;

  @IsString()
  name!: string;
}

export class GetActivityEventDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  targetId!: string | null;

  @IsDate()
  createdAt!: Date;

  @IsEnum(ActivityEventType)
  eventType!: ActivityEventType;

  @IsOptional()
  @IsEnum(ActivityActorType)
  actorType!: ActivityActorType | null;

  @IsOptional()
  @IsString()
  actorId!: string | null;

  @IsOptional()
  @IsObject()
  metadata!: ActivityEventMetadata<ActivityEventType> | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityEventReferenceDto)
  actor?: ActivityEventReferenceDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityEventReferenceDto)
  target?: ActivityEventReferenceDto | null;
}

export class GetActivityEventOptsDto {
  @IsOptional()
  @IsEnum(GetActivityEventWith, { each: true })
  with?: GetActivityEventWith[];
}

export class ListActivityEventsDto extends GetPaginatedQuery {
  @IsOptional()
  @IsEnum(GetActivityEventWith, { each: true })
  with?: GetActivityEventWith[];

  @IsIn(['createdAt'])
  sort?: string;
}

export interface ExportActivityEventDto {
  Id: string;
  CreatedAt: string;
  EventType: ActivityEventType;
  ActorType: ActivityActorType | null;
  ActorId: string;
  TargetId: string;
  Metadata: string;
}
