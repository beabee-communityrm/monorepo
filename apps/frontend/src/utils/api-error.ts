import { isApiError } from '@beabee/client';

/**
 * Extract error code from an API error for use with AppForm component
 * @param error - The error object to extract code from
 * @param statusCodes - Optional array of HTTP status codes to match (defaults to [400, 401])
 * @returns The error code or 'unknown' if not a matching API error
 */
export function extractApiErrorCode(
  error: unknown,
  statusCodes: number[] = [400, 401]
): string {
  return isApiError(error, undefined, statusCodes)
    ? error.code || 'unknown'
    : 'unknown';
}
