import { Contact } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import {
  Authorized,
  Get,
  JsonController,
  QueryParams,
} from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import { TargetUser } from '#api/decorators/TargetUser';
import {
  GetActivityEventDto,
  ListActivityEventsDto,
} from '#api/dto/ActivityFeedDto';
import { PaginatedDto } from '#api/dto/PaginatedDto';
import ActivityFeedTransformer from '#api/transformers/ActivityFeedTransformer';

@JsonController('/activity')
@Authorized()
export class ActivityFeedController {}
