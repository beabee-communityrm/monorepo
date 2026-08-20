import {
  ActivityFilterName,
  Rule,
  activityFilters,
} from '@beabee/beabee-common';
import { ActivityEvent } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { TransformPlainToInstance } from 'class-transformer';

import {
  GetActivityEventDto,
  ListActivityEventsDto,
} from '#api/dto/ActivityFeedDto';
import { PaginatedDto } from '#api/dto/PaginatedDto';
import { BaseTransformer } from '#api/transformers/BaseTransformer';

class ActivityFeedTransformer extends BaseTransformer<
  ActivityEvent,
  GetActivityEventDto,
  ActivityFilterName
> {
  protected model = ActivityEvent;
  protected filters = activityFilters;

  @TransformPlainToInstance(GetActivityEventDto)
  convert(event: ActivityEvent): GetActivityEventDto {
    return {
      id: event.id,
      createdAt: event.createdAt,
      eventType: event.eventType,
      actorType: event.actorType,
      actorId: event.actorId,
      metadata: event.metadata,
    };
  }

  // Non-admins only see their own events
  protected async getNonAdminAuthRules(): Promise<Rule[]> {
    return [{ field: 'targetId', operator: 'equal', value: ['me'] }];
  }

  /**
   * Fetch activity feed events for a target
   * @param auth Authentication info
   * @param targetId Target whose events are requested
   */
  async fetchByTargetId(
    auth: AuthInfo,
    targetId: string,
    query: ListActivityEventsDto
  ): Promise<PaginatedDto<GetActivityEventDto>> {
    return await this.fetch(auth, {
      ...query,
      sort: query.sort || 'createdAt',
      order: query.order || 'DESC',
      rules: {
        condition: 'AND',
        rules: [
          ...(query.rules ? [query.rules] : []),
          { field: 'targetId', operator: 'equal', value: [targetId] },
        ],
      },
    });
  }
}

export default new ActivityFeedTransformer();
