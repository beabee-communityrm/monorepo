/** Maintenance operations an Operator triggers through the API */
export enum JobName {
  DatabaseClean = 'database-clean',
  HealthCheck = 'health-check',
  ImageBackfillDimensions = 'image-backfill-dimensions',
  MailchimpSetup = 'mailchimp-setup',
  NewsletterActiveMemberTag = 'newsletter-active-member-tag',
  NewsletterClearPendingStatus = 'newsletter-clear-pending-status',
  NewsletterReconcile = 'newsletter-reconcile',
  NewsletterRefreshCachedGroups = 'newsletter-refresh-cached-groups',
  RateLimiterClear = 'rate-limiter-clear',
  SegmentsProcess = 'segments-process',
  StripeSetup = 'stripe-setup',
  StripeSync = 'stripe-sync',
}
