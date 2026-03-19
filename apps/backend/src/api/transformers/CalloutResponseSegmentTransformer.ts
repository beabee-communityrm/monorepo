import { PaginatedQuery, segmentFilters } from '@beabee/beabee-common';
import { InvalidRuleError } from '@beabee/core/errors';
import { CalloutResponseSegment } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { TransformPlainToInstance } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

import {
  GetCalloutResponseSegmentDto,
  GetCalloutResponseSegmentOptsDto,
  GetCalloutResponseSegmentWith,
  ListCalloutResponseSegmentsDto,
} from '#api/dto/CalloutResponseSegmentDto';
import { TransformerOperation } from '#type/transformer-operation';

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
      ...(opts.with?.includes(GetCalloutResponseSegmentWith.itemCount) && {
        itemCount: calloutSegment.itemCount,
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
    if (query.includeGlobalSegments) {
      const calloutId = query.calloutId;
      qb.where(
        `(${fieldPrefix}calloutId = :calloutId OR ${fieldPrefix}calloutId IS NULL)`,
        { calloutId }
      );
    }
  }

  protected async modifyItems(
    segments: CalloutResponseSegment[],
    query: ListCalloutResponseSegmentsDto,
    auth: AuthInfo
  ): Promise<void> {
    if (query.with?.includes(GetCalloutResponseSegmentWith.itemCount)) {
      for (const segment of segments) {
        try {
          const result = await CalloutResponseTransformer.fetchForCallout(
            auth,
            query.calloutId,
            {
              rules: segment.ruleGroup,
            }
          );
          segment.itemCount = result.total;
        } catch (err) {
          // If rules are invalid, set itemCount to undefined so the segment
          // can still be fetched and displayed in the frontend
          if (err instanceof InvalidRuleError) {
            segment.itemCount = undefined;
          } else {
            throw err;
          }
        }
      }
    }
  }
}

export default new CalloutResponseSegmentTransformer();
