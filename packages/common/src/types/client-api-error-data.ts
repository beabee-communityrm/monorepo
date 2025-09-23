export interface ClientApiErrorData {
  code?: string;
  errors?: {
    [key: string]: unknown;
  };
  httpCode?: number;
  /** Seconds until the client may retry (from Retry-After header) */
  retryAfterSeconds?: number;
}
