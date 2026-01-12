import { SYNC_NEWSLETTER_RECONCILE_TESTS } from '../constants/sync.js';

export interface SyncNewsletterActiveMemberTagArgs {
  startDate: string;
  endDate: string;
  dryRun: boolean;
}

export type SyncNewsletterReconcileTestId =
  (typeof SYNC_NEWSLETTER_RECONCILE_TESTS)[number];

export interface SyncNewsletterReconcileArgs {
  dryRun: boolean;
  report: boolean;
  uploadNew: boolean;
  fix: SyncNewsletterReconcileTestId[];
}

export interface SyncSegmentsArgs {
  segmentId: string;
  dryRun: boolean;
}

export interface SyncStripeArgs {
  dryRun: boolean;
}
