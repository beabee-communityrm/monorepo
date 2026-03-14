import type { SegmentOngoingEmailTrigger } from './segment-ongoing-email-trigger.js';

/**
 * Full email entity data with metadata
 * Used for CRUD operations on email entities
 */
export interface GetEmailData {
  id: string;
  /** Template ID if this is a system template override, undefined for custom emails */
  templateId?: string;
  name: string;
  fromName: string | null;
  fromEmail: string | null;
  subject: string;
  body: string;
  date: string;
  mailingCount?: number;
  /** Whether this email is linked to an ongoing segment email */
  isOngoing?: boolean;
  /** Segment ID if this is an ongoing email */
  segmentId?: string;
  /** Segment name for display purposes */
  segmentName?: string;
  /** Trigger type for ongoing emails */
  trigger?: SegmentOngoingEmailTrigger;
  /** Whether the ongoing email is active (not paused) */
  enabled?: boolean;
}
