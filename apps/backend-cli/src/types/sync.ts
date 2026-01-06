export interface SyncNewsletterActiveMemberTagArgs {
  startDate: string;
  endDate: string;
  dryRun: boolean;
}

export interface SyncNewsletterReconcileArgs {
  startDate: string;
  endDate: string;
  dryRun: boolean;
}

export interface SyncSegmentsArgs {
  segmentId: string;
  dryRun: boolean;
}

export interface SyncStripeArgs {
  dryRun: boolean;
}
