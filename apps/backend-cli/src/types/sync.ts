export interface SyncNewsletterActiveMemberTagArgs {
  startDate: Date;
  endDate: Date;
  dryRun: boolean;
}

export interface SyncNewsletterReconcileArgs {
  dryRun: boolean;
  updateThem: boolean;
  report: boolean;
}

export interface SyncSegmentsArgs {
  segmentId: string;
  dryRun: boolean;
}

export interface SyncStripeArgs {
  dryRun: boolean;
}
