/**
 * Options for image migration
 */
export interface MigrateImagesOptions {
  /** Source directory containing images to migrate */
  source: string;
  /** Target S3/MinIO bucket name */
  bucket: string;
  /** S3/MinIO endpoint URL */
  endpoint: string;
  /** S3/MinIO access key */
  accessKey: string;
  /** S3/MinIO secret key */
  secretKey: string;
  /** S3/MinIO region */
  region: string;
  /** Whether to perform a dry run (no actual uploads) */
  dryRun?: boolean;
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
