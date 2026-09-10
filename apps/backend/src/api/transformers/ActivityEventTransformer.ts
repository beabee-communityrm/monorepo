import {
  ActivityFilterName,
  PaginatedQuery,
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

class ActivityEventTransformer extends BaseTransformer<
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
      targetId: event.targetId,
      createdAt: event.createdAt,
      eventType: event.eventType,
      actorType: event.actorType,
      actorId: event.actorId,
      metadata: event.metadata,
    };
  }

  // Sort by created at unless asked otherwise
  protected transformQuery<T extends PaginatedQuery>(query: T): T {
    return {
      ...query,
      sort: query.sort || 'createdAt',
      order: query.order || 'DESC',
    };
  }

  // Non-admins only see events about them or caused by them
  protected async getNonAdminAuthRules(): Promise<Rule[]> {
    return [
      { field: 'targetId', operator: 'equal', value: ['me'] },
      { field: 'actorId', operator: 'equal', value: ['me'] },
    ];
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

export default new ActivityEventTransformer();
