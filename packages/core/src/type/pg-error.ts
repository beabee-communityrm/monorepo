/**
 * Represents a PostgreSQL database error structure
 * @interface PgError
 * @example
 * {
 *   code: "23505",
 *   detail: "Key (email)=(test@example.com) already exists."
 * }
 */
export interface PgError {
  /** The PostgreSQL error code (e.g., "23505" for unique violation) */
  code: string;
  /** Detailed error message from PostgreSQL explaining what went wrong */
  detail: string;
}
