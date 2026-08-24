import { ActivityActorType, ActivityEventType } from '@beabee/beabee-common';

import {
  IsDate,
  IsEnum,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { GetPaginatedQuery } from '#api/dto/BaseDto';

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

  @IsEnum(ActivityActorType)
  actorType!: ActivityActorType;

  @IsOptional()
  @IsString()
  actorId!: string | null;

  @IsOptional()
  @IsObject()
  metadata!: Record<string, string> | null;
}

export class ListActivityEventsDto extends GetPaginatedQuery {
  @IsIn(['createdAt'])
  sort?: string;
}
