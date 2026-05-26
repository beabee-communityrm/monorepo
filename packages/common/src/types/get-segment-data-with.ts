import type { GetSegmentData, GetSegmentWith, Noop } from './index.js';

export type GetSegmentDataWith<With extends GetSegmentWith> = GetSegmentData &
  ('itemCount' extends With ? { itemCount: number | undefined } : Noop);
