import type { JobName } from '../data/index.js';
import type { HealthIntegration } from './health-integration.js';
import type { NewsletterReconcileTest } from './newsletter-reconcile-test.js';
import type { StripeSyncFix } from './stripe-sync-fix.js';

/** database-clean takes no arguments */
export interface DatabaseCleanJobArgs {}

export interface HealthCheckJobArgs {
  /** Defaults to all integrations */
  integrations?: HealthIntegration[];
  /** Log unhealthy integrations at error level so they trigger alerts */
  notify?: boolean;
}

export interface DryRunJobArgs {
  dryRun?: boolean;
}

export interface NewsletterActiveMemberTagJobArgs extends DryRunJobArgs {
  since: Date;
  /** Defaults to now */
  until?: Date;
}

export interface NewsletterReconcileJobArgs extends DryRunJobArgs {
  /** Log the differences found before fixing them */
  report?: boolean;
  importNew?: boolean;
  uploadNew?: boolean;
  fix: NewsletterReconcileTest[];
  since?: Date;
  until?: Date;
}

export interface RateLimiterClearJobArgs {
  /** Clear even when the instance is not in dev mode */
  force?: boolean;
}

export interface SegmentsProcessJobArgs {
  /** Defaults to every segment */
  segmentId?: string;
}

export interface StripeSyncJobArgs extends DryRunJobArgs {
  contactIds?: string[];
  fix: StripeSyncFix[];
}

/** The arguments each Job accepts, keyed by job name */
export interface JobArgsMap {
  [JobName.DatabaseClean]: DatabaseCleanJobArgs;
  [JobName.HealthCheck]: HealthCheckJobArgs;
  [JobName.ImageBackfillDimensions]: DryRunJobArgs;
  [JobName.MailchimpSetup]: DryRunJobArgs;
  [JobName.NewsletterActiveMemberTag]: NewsletterActiveMemberTagJobArgs;
  [JobName.NewsletterClearPendingStatus]: DryRunJobArgs;
  [JobName.NewsletterReconcile]: NewsletterReconcileJobArgs;
  [JobName.NewsletterRefreshCachedGroups]: DryRunJobArgs;
  [JobName.RateLimiterClear]: RateLimiterClearJobArgs;
  [JobName.SegmentsProcess]: SegmentsProcessJobArgs;
  [JobName.StripeSetup]: DryRunJobArgs;
  [JobName.StripeSync]: StripeSyncJobArgs;
}
