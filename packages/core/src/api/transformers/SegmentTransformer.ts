import {
  RoleType,
  SegmentFilterName,
  segmentFilters
} from "@beabee/beabee-common";
import { TransformPlainToInstance } from "class-transformer";

import {
  GetSegmentDto,
  GetSegmentOptsDto,
  GetSegmentWith,
  ListSegmentsDto
} from "../dto/SegmentDto";
import { BaseTransformer } from "./BaseTransformer";
import { contactTransformer } from "./ContactTransformer";

import { Segment } from "@beabee/core/models";

import { AuthInfo } from "@beabee/core/type";

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
      ...(opts.with?.includes(GetSegmentWith.contactCount) && {
        contactCount: segment.contactCount
      })
    };
  }

  protected async modifyItems(
    segments: Segment[],
    query: ListSegmentsDto,
    auth: AuthInfo
  ): Promise<void> {
    if (query.with?.includes(GetSegmentWith.contactCount)) {
      for (const segment of segments) {
        const result = await contactTransformer.fetch(auth, {
          limit: 0,
          rules: segment.ruleGroup
        });
        segment.contactCount = result.total;
      }
    }
  }
}

export const segmentTransformer = new SegmentTransformer();
