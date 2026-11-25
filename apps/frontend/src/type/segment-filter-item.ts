export interface SegmentFilterItem {
  /** Empty for the "all contacts" item */
  id: string;
  label: string;
  to: string;
  /** Number of contacts in the segment, once loaded */
  count?: number;
}
