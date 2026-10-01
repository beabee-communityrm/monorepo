import { JobName } from '@beabee/beabee-common';

import type { JobRegistry } from '#type/job';

import { databaseCleanJob } from './database-clean.js';
import { healthCheckJob } from './health-check.js';
import { imageBackfillDimensionsJob } from './image-backfill-dimensions.js';
import { mailchimpSetupJob } from './mailchimp-setup.js';
import { newsletterActiveMemberTagJob } from './newsletter-active-member-tag.js';
import { newsletterClearPendingStatusJob } from './newsletter-clear-pending-status.js';
import { newsletterReconcileJob } from './newsletter-reconcile.js';
import { newsletterRefreshCachedGroupsJob } from './newsletter-refresh-cached-groups.js';
import { rateLimiterClearJob } from './rate-limiter-clear.js';
import { segmentsProcessJob } from './segments-process.js';
import { stripeSetupJob } from './stripe-setup.js';
import { stripeSyncJob } from './stripe-sync.js';

export const jobs: JobRegistry = {
  [JobName.DatabaseClean]: databaseCleanJob,
  [JobName.HealthCheck]: healthCheckJob,
  [JobName.ImageBackfillDimensions]: imageBackfillDimensionsJob,
  [JobName.MailchimpSetup]: mailchimpSetupJob,
  [JobName.NewsletterActiveMemberTag]: newsletterActiveMemberTagJob,
  [JobName.NewsletterClearPendingStatus]: newsletterClearPendingStatusJob,
  [JobName.NewsletterReconcile]: newsletterReconcileJob,
  [JobName.NewsletterRefreshCachedGroups]: newsletterRefreshCachedGroupsJob,
  [JobName.RateLimiterClear]: rateLimiterClearJob,
  [JobName.SegmentsProcess]: segmentsProcessJob,
  [JobName.StripeSetup]: stripeSetupJob,
  [JobName.StripeSync]: stripeSyncJob,
};
