/**
 * Result object returned by batchSelect execution.
 * Mirrors the structure of TypeORM's UpdateResult for consistency.
 */
export interface SelectResult {
  /**
   * Raw SQL result returned by executed query.
   */
  raw: any[];

  /**
   * Number of selected rows/documents
   */
  affected?: number;
}
