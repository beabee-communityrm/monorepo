import type { SegmentOngoingEmailTrigger } from './segment-ongoing-email-trigger.js';

/**
 * Data for updating an email.
 * All fields are optional to support partial updates (e.g. toggling enabled).
 */
export interface UpdateEmailData {
  name?: string;
  subject?: string;
  body?: string;
  isOngoing?: boolean;
  segmentId?: string;
  trigger?: SegmentOngoingEmailTrigger;
  enabled?: boolean;
}
