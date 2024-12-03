import type { GetSegmentData, GetSegmentWith, Noop } from "./index.js";

export type GetSegmentDataWith<With extends GetSegmentWith> =
  & GetSegmentData
  & ("contactCount" extends With ? { contactCount: number } : Noop);
