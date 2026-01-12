import { SYNC_NEWSLETTER_RECONCILE_TESTS } from '../constants/sync.js';

export interface SyncNewsletterActiveMemberTagArgs {
  since: Date;
  until: Date;
  dryRun: boolean;
}

export type SyncNewsletterReconcileTestId =
  (typeof SYNC_NEWSLETTER_RECONCILE_TESTS)[number];

export interface SyncNewsletterReconcileArgs {
  dryRun: boolean;
  report: boolean;
  importNew: boolean;
  uploadNew: boolean;
  fix: SyncNewsletterReconcileTestId[];
  since: Date | undefined;
  until: Date | undefined;
}

export interface SyncClearPendingStatusArgs {
  dryRun: boolean;
}

export interface SyncSegmentsArgs {
  segmentId: string;
  dryRun: boolean;
}

export interface SyncStripeArgs {
  dryRun: boolean;
}
