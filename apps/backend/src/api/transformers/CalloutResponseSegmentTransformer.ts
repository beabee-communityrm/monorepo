import { PaginatedQuery, segmentFilters } from '@beabee/beabee-common';
import { CalloutResponseSegment } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import {
  GetCalloutResponseSegmentDto,
  GetCalloutResponseSegmentOptsDto,
  GetCalloutResponseSegmentWith,
  ListCalloutResponseSegmentsDto,
} from '@api/dto/CalloutResponseSegmentDto';
import { TransformerOperation } from '@type/transformer-operation';
import { TransformPlainToInstance } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

import { BaseTransformer } from './BaseTransformer';
import CalloutResponseTransformer from './CalloutResponseTransformer';

class CalloutResponseSegmentTransformer extends BaseTransformer<
  CalloutResponseSegment,
  GetCalloutResponseSegmentDto,
  string,
  GetCalloutResponseSegmentOptsDto,
  ListCalloutResponseSegmentsDto & PaginatedQuery
> {
  protected model = CalloutResponseSegment;
  protected filters = segmentFilters;

  @TransformPlainToInstance(GetCalloutResponseSegmentDto)
  convert(
    calloutSegment: CalloutResponseSegment,
    auth: AuthInfo,
    opts: GetCalloutResponseSegmentOptsDto
  ): GetCalloutResponseSegmentDto {
    return {
      id: calloutSegment.id,
      name: calloutSegment.name,
      ruleGroup: calloutSegment.ruleGroup,
      order: calloutSegment.order,
      ...(opts.with?.includes(
        GetCalloutResponseSegmentWith.calloutResponseCount
      ) && {
        calloutResponseCount: calloutSegment.calloutResponseCount,
      }),
    };
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<CalloutResponseSegment>,
    fieldPrefix: string,
    query: ListCalloutResponseSegmentsDto,
    auth: AuthInfo,
    operation: TransformerOperation
  ): void {
    // we only want this to run on fetch multiple
    // we want global filters and filter matching the current callout
    if (operation === 'read' && !(query.limit === 1)) {
      const calloutId = query.calloutId;
      qb.where(
        `(${fieldPrefix}calloutId = :calloutId OR ${fieldPrefix}isGlobal = true)`,
        { calloutId }
      );
    }
  }

  protected async modifyItems(
    segments: CalloutResponseSegment[],
    query: ListCalloutResponseSegmentsDto,
    auth: AuthInfo
  ): Promise<void> {
    if (
      query.with?.includes(GetCalloutResponseSegmentWith.calloutResponseCount)
    ) {
      for (const segment of segments) {
        const result = await CalloutResponseTransformer.fetchForCallout(
          auth,
          query.calloutId,
          {
            limit: 0,
            rules: {
              condition: 'AND',
              rules: [segment.ruleGroup],
            },
          }
        );
        segment.calloutResponseCount = result.total;
      }
    }
  }
}

export default new CalloutResponseSegmentTransformer();
