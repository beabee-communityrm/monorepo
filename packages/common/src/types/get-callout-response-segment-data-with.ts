import type { GetSegmentData, GetSegmentWith, Noop } from './index.js';

export type GetCalloutResponseSegmentDataWith<With extends GetSegmentWith> =
  GetSegmentData &
    ('calloutResponseCount' extends With
      ? { calloutResponseCount: number }
      : Noop);
