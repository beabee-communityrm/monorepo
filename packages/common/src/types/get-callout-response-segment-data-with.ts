import type {
  GetCalloutResponseSegmentWith,
  GetSegmentData,
  Noop,
} from './index.js';

export type GetCalloutResponseSegmentDataWith<
  With extends GetCalloutResponseSegmentWith,
> = GetSegmentData &
  ('calloutResponseCount' extends With
    ? { calloutResponseCount: number }
    : Noop);
