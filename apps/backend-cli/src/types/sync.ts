export interface SyncNewsletterActiveMemberTagArgs {
  startDate: Date;
  endDate: Date;
  dryRun: boolean;
}

export interface SyncNewsletterReconcileArgs {
  dryRun: boolean;
  updateThem: boolean;
  report: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export interface SyncSegmentsArgs {
  segmentId: string;
  dryRun: boolean;
}

export interface SyncStripeArgs {
  dryRun: boolean;
}
