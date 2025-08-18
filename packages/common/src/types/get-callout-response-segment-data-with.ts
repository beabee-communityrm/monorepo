import type { GetSegmentData, GetCalloutResponseSegmentWith, Noop } from './index.js';

export type GetCalloutResponseSegmentDataWith<
  With extends GetCalloutResponseSegmentWith,
> = GetSegmentData &
  ('calloutResponseCount' extends With ? { calloutResponseCount: number } : Noop);
