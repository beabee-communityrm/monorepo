import type { SegmentOngoingEmailTrigger } from './segment-ongoing-email-trigger.js';

/**
 * Shared fields for creating/updating an ongoing email link.
 */
export interface OngoingEmailFields {
  isOngoing?: boolean;
  segmentId?: string;
  trigger?: SegmentOngoingEmailTrigger;
  enabled?: boolean;
}
