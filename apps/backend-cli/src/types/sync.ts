export interface SyncNewsletterActiveMemberTagArgs {
  since: Date;
  until: Date;
  dryRun: boolean;
}

export interface SyncNewsletterReconcileArgs {
  dryRun: boolean;
  updateThem: boolean;
  report: boolean;
  since: Date | undefined;
  until: Date | undefined;
}

export interface SyncSegmentsArgs {
  segmentId: string;
  dryRun: boolean;
}

export interface SyncStripeArgs {
  dryRun: boolean;
}
