import type { GetSegmentData, GetSegmentWith, Noop } from '@type';

export type GetSegmentDataWith<With extends GetSegmentWith> = GetSegmentData &
  ('contactCount' extends With ? { contactCount: number } : Noop);
