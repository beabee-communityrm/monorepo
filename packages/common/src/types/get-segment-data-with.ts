import { GetSegmentData, GetSegmentWith, Noop } from "./index.ts";

export type GetSegmentDataWith<With extends GetSegmentWith> =
  & GetSegmentData
  & ("contactCount" extends With ? { contactCount: number } : Noop);
