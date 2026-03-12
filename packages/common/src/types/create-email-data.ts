import type { SegmentOngoingEmailTrigger } from './segment-ongoing-email-trigger.js';

export interface CreateEmailData {
  name: string;
  fromName?: string;
  fromEmail?: string;
  subject: string;
  body: string;
  isOngoing?: boolean;
  segmentId?: string;
  trigger?: SegmentOngoingEmailTrigger;
}
