import { AuthInfo } from '@beabee/core/type';

import {
  Authorized,
  Get,
  JsonController,
  QueryParams,
} from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import {
  GetActivityEventDto,
  ListActivityEventsDto,
} from '#api/dto/ActivityFeedDto';
import { PaginatedDto } from '#api/dto/PaginatedDto';
import ActivityFeedTransformer from '#api/transformers/ActivityFeedTransformer';

@JsonController('/activity')
@Authorized()
export class ActivityFeedController {
  /**
   * Get all activity feed events
   */
  @Get('/')
  async getEvents(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListActivityEventsDto
  ): Promise<PaginatedDto<GetActivityEventDto>> {
    return await ActivityFeedTransformer.fetch(auth, query);
  }
}
