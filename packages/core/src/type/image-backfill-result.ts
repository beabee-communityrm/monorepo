/**
 * Result of backfilling image dimensions into S3 metadata
 */
export interface ImageBackfillResult {
  /** Images whose dimensions were written (or would be in a dry run) */
  updated: number;
  /** Images that already had dimensions stored */
  skipped: number;
  /** Images that could not be processed */
  failed: number;
}
