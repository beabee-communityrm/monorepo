export interface SyncMailchimpArgs {
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

export interface SyncNewsletterStatusArgs {
  dryRun: boolean;
}
