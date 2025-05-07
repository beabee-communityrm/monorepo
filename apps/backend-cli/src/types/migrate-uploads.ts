export interface MigrateUploadsArgs {
  source: string;
  dryRun: boolean;
  /**
   * Comma-separated list of migration steps to run. Allowed values:
   * - calloutImages
   * - optionImages
   * - contentBackgroundImage
   * - calloutResponseDocuments
   * If not provided, all steps will be run.
   */
  steps?: string[];
}

/**
 * Options for uploads migration
 */
export interface MigrateUploadsOptions {
  /** Source directory containing images and documents to migrate */
  source: string;
  /** Whether to perform a dry run (no actual uploads) */
  dryRun?: boolean;
  /**
   * Array of migration steps to run. Allowed values:
   * - calloutImages
   * - optionImages
   * - contentBackgroundImage
   * - calloutResponseDocuments
   * If not provided, all steps will be run.
   */
  steps: string[];
}

/**
 * Represents migration statistics
 */
export interface MigrationStats {
  /** Number of successfully migrated files */
  successCount: number;
  /** Number of files that were skipped (already exist) */
  skippedCount: number;
  /** Number of files that failed to migrate */
  errorCount: number;
  /** Total size of migrated files in bytes */
  totalSizeBytes: number;
}
