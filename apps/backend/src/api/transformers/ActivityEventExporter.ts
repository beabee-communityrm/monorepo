import { ActivityFilterName, activityFilters } from '@beabee/beabee-common';
import { ActivityEvent } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { stringify } from 'csv-stringify/sync';

import { ExportActivityEventDto } from '#api/dto/ActivityFeedDto';
import { GetExportQuery } from '#api/dto/BaseDto';

import { BaseTransformer } from './BaseTransformer.js';

class ActivityEventExporter extends BaseTransformer<
  ActivityEvent,
  ExportActivityEventDto,
  ActivityFilterName,
  GetExportQuery
> {
  protected model = ActivityEvent;
  protected filters = activityFilters;

  convert(event: ActivityEvent): ExportActivityEventDto {
    return {
      Id: event.id,
      CreatedAt: event.createdAt.toISOString(),
      EventType: event.eventType,
      ActorType: event.actorType,
      ActorId: event.actorId || '',
      TargetId: event.targetId || '',
      Metadata: event.metadata ? JSON.stringify(event.metadata) : '',
    };
  }

  async export(
    auth: AuthInfo,
    query?: GetExportQuery
  ): Promise<[string, string]> {
    const result = await this.fetch(auth, {
      limit: -1,
      sort: 'createdAt',
      order: 'DESC',
      ...query,
    });

    const exportName = `activity-${new Date().toISOString()}.csv`;
    return [exportName, stringify(result.items, { header: true })];
  }
}

export default new ActivityEventExporter();
