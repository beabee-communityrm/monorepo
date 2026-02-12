import { SegmentFilterName, segmentFilters } from '@beabee/beabee-common';
import { InvalidRuleError } from '@beabee/core/errors';
import { Segment } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { TransformPlainToInstance } from 'class-transformer';

import {
  GetSegmentDto,
  GetSegmentOptsDto,
  GetSegmentWith,
  ListSegmentsDto,
} from '#api/dto/SegmentDto';
import { BaseTransformer } from '#api/transformers/BaseTransformer';
import ContactTransformer from '#api/transformers/ContactTransformer';

class SegmentTransformer extends BaseTransformer<
  Segment,
  GetSegmentDto,
  SegmentFilterName,
  GetSegmentOptsDto
> {
  protected model = Segment;
  protected filters = segmentFilters;

  @TransformPlainToInstance(GetSegmentDto)
  convert(
    segment: Segment,
    auth: AuthInfo,
    opts: GetSegmentOptsDto
  ): GetSegmentDto {
    return {
      id: segment.id,
      name: segment.name,
      description: segment.description,
      ruleGroup: segment.ruleGroup,
      order: segment.order,
      ...(opts.with?.includes(GetSegmentWith.itemCount) && {
        itemCount: segment.itemCount,
      }),
    };
  }

  protected async modifyItems(
    segments: Segment[],
    query: ListSegmentsDto,
    auth: AuthInfo
  ): Promise<void> {
    if (query.with?.includes(GetSegmentWith.itemCount)) {
      for (const segment of segments) {
        try {
          const result = await ContactTransformer.fetch(auth, {
            limit: 0,
            rules: segment.ruleGroup,
          });
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

export default new SegmentTransformer();
