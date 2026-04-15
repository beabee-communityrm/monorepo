import type {
  BaseApiErrorData as CommonClientApiErrorData,
  PaymentFailedData,
  PaymentRequiresActionErrorData,
  TooManyRequestsErrorData,
} from '@beabee/beabee-common';

export interface ClientApiErrorData extends CommonClientApiErrorData {
  name?: string;
  /** Seconds until the client may retry (from Retry-After header) */
  retryAfterSeconds?: number;
}

export type {
  PaymentFailedData,
  PaymentRequiresActionErrorData,
  TooManyRequestsErrorData,
};
