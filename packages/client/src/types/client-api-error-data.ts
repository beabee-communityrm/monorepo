import type { ClientApiErrorData as CommonClientApiErrorData } from '@beabee/beabee-common';

export interface ClientApiErrorData extends CommonClientApiErrorData {
  name?: string;
  /** Seconds until the client may retry (from Retry-After header) */
  retryAfterSeconds?: number;
}
