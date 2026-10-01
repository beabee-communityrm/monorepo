import {
  ActivityActorType,
  HEALTH_INTEGRATIONS,
  HealthIntegration,
  NEWSLETTER_RECONCILE_TESTS,
  NewsletterReconcileTest,
  STRIPE_SYNC_FIXES,
  StripeSyncFix,
} from '@beabee/beabee-common';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsObject,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class RunJobDto {
  /** Validated against the job's own args DTO once the job is known */
  @IsObject()
  args!: object;

  /** Who triggered the job, recorded in the activity feed */
  @IsIn([ActivityActorType.BackendCLI, ActivityActorType.Cron])
  actor!: ActivityActorType.BackendCLI | ActivityActorType.Cron;
}

export class DatabaseCleanJobArgsDto {}

export class DryRunJobArgsDto {
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

export class HealthCheckJobArgsDto {
  @IsOptional()
  @IsArray()
  @IsIn(HEALTH_INTEGRATIONS, { each: true })
  integrations?: HealthIntegration[];

  @IsOptional()
  @IsBoolean()
  notify?: boolean;
}

export class NewsletterActiveMemberTagJobArgsDto extends DryRunJobArgsDto {
  @Type(() => Date)
  @IsDate()
  since!: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  until?: Date;
}

export class NewsletterReconcileJobArgsDto extends DryRunJobArgsDto {
  @IsOptional()
  @IsBoolean()
  report?: boolean;

  @IsOptional()
  @IsBoolean()
  importNew?: boolean;

  @IsOptional()
  @IsBoolean()
  uploadNew?: boolean;

  @IsArray()
  @IsIn(NEWSLETTER_RECONCILE_TESTS, { each: true })
  fix!: NewsletterReconcileTest[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  since?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  until?: Date;
}

export class RateLimiterClearJobArgsDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class SegmentsProcessJobArgsDto {
  @IsOptional()
  @IsUUID()
  segmentId?: string;
}

export class StripeSyncJobArgsDto extends DryRunJobArgsDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  contactIds?: string[];

  @IsArray()
  @IsIn(STRIPE_SYNC_FIXES, { each: true })
  fix!: StripeSyncFix[];
}
