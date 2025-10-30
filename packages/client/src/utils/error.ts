import type { ClientApiErrorData } from '../types/index.js';

export function getErrorNameFromStatus(status: number): string {
  switch (status) {
    case 400:
      return 'BadRequestError';
    case 401:
      return 'UnauthorizedError';
    case 403:
      return 'ForbiddenError';
    case 404:
      return 'NotFoundError';
    case 409:
      return 'ConflictError';
    case 422:
      return 'ValidationError';
    case 429:
      return 'TooManyRequestsError';
    case 500:
      return 'InternalServerError';
    case 502:
      return 'BadGatewayError';
    case 503:
      return 'ServiceUnavailableError';
    case 504:
      return 'GatewayTimeoutError';
    default:
      return status >= 500 ? 'ServerError' : 'ClientError';
  }
}

export class ClientApiError extends Error implements ClientApiErrorData {
  code: string;
  errors?: {
    [key: string]: unknown;
  };
  httpCode: number;
  retryAfterSeconds?: number;
  name: string;

  constructor(
    message: string,
    data: {
      code: string;
      httpCode: number;
      errors?: { [key: string]: unknown };
      retryAfterSeconds?: number;
      name?: string;
    }
  ) {
    super(message);
    this.code = data.code;
    this.httpCode = data.httpCode;
    this.errors = data.errors;
    this.retryAfterSeconds = data.retryAfterSeconds;
    this.name = data.name || getErrorNameFromStatus(this.httpCode);
  }
}

/**
 * Type guard to check if an object has the structure of an API error response from the backend
 * @param obj - The object to check
 * @param codes - Optional array of error codes to match against
 * @param status - Optional array of HTTP status codes to match against
 */
export function isApiErrorResponse(
  obj: unknown,
  codes: string[] = [],
  status: number[] = []
): obj is ClientApiErrorData {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const errorObj = obj as Record<string, unknown>;

  // Check for required properties
  if (
    typeof errorObj.code !== 'string' ||
    typeof errorObj.httpCode !== 'number'
  ) {
    return false;
  }

  // Optional validation against specific codes and statuses
  const hasMatchingStatus =
    !status.length || status.includes(errorObj.httpCode);
  const hasMatchingCode = !codes.length || codes.includes(errorObj.code);

  return hasMatchingStatus && hasMatchingCode;
}

/**
 * Type guard to check if an error is a ClientApiError with specific status and/or error codes
 * @param err - The error to check
 * @param codes - Optional array of error codes to match against
 * @param status - Optional array of HTTP status codes to match against
 */
export function isApiError(
  err: unknown,
  codes?: string[]
): err is ClientApiError;
export function isApiError(
  err: unknown,
  codes: string[] | undefined,
  status: number[]
): err is ClientApiError;
export function isApiError(
  err: unknown,
  codes: string[] = [],
  status: number[] = [400]
): err is ClientApiError {
  if (err instanceof ClientApiError) {
    const hasMatchingStatus =
      !status.length || (!!err.httpCode && status.includes(err.httpCode));
    const hasMatchingCode =
      !codes.length || (!!err.code && codes.includes(err.code));
    return hasMatchingStatus && hasMatchingCode;
  }
  return false;
}
