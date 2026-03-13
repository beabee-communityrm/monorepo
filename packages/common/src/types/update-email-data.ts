import { EmailPreviewData } from './index.js';
import type { SegmentOngoingEmailTrigger } from './segment-ongoing-email-trigger.js';

/**
 * Data for updating an email.
 * Subject and body are required; name is optional (custom emails only).
 */
export type UpdateEmailData = EmailPreviewData & {
  name?: string;
  isOngoing?: boolean;
  segmentId?: string;
  trigger?: SegmentOngoingEmailTrigger;
};
