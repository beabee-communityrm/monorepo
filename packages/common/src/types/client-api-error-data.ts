export const errorCodes = [
  'bad-request',
  'unauthorized',
  'forbidden',
  'not-found',
  'conflict',
  'validation-error',
  'payment-failed',
  'payment-requires-action',
  'too-many-requests',
  'file-too-large',
  'unsupported-file-type',
  'duplicate-id',
  'duplicate-email',
  'duplicate-tag-name',
  'internal-server-error',
] as const;

export type ErrorCode = (typeof errorCodes)[number];

// TODO: Use this in the backend too to make it consistent
export interface BaseApiErrorData {
  httpCode: number;
  code: ErrorCode;
  message: string;
  errors?: {
    [key: string]: unknown;
  };
}

export interface BadRequestErrorData extends BaseApiErrorData {
  httpCode: 400;
}

export interface UnauthorizedErrorData extends BaseApiErrorData {
  httpCode: 401;
  code: 'unauthorized';
  subCode: string | undefined;
}

export interface ForbiddenErrorData extends BaseApiErrorData {
  code: 'forbidden';
}

export interface NotFoundErrorData extends BaseApiErrorData {
  httpCode: 404;
  code: 'not-found';
}

export interface ConflictErrorData extends BaseApiErrorData {
  code: 'conflict';
}

export interface ValidationErrorData extends BaseApiErrorData {
  code: 'validation-error';
}

export interface PaymentFailedData extends BadRequestErrorData {
  code: 'payment-failed';
  subCode: string;
}

export interface PaymentRequiresActionErrorData extends BadRequestErrorData {
  code: 'payment-requires-action';
  clientSecret: string;
}

export interface TooManyRequestsErrorData extends BaseApiErrorData {
  httpCode: 429;
  code: 'too-many-requests';
  retryAfter: number;
}

export interface FileTooLargeErrorData extends BadRequestErrorData {
  code: 'file-too-large';
  maxSize: number;
}

export interface UnsupportedFileTypeErrorData extends BaseApiErrorData {
  httpCode: 415;
  code: 'unsupported-file-type';
  allowedTypes: string[];
}

export interface DuplicateIdErrorData extends BaseApiErrorData {
  code: 'duplicate-id';
  id: string;
}

export interface DuplicateEmailErrorData extends BaseApiErrorData {
  code: 'duplicate-email';
  email: string;
}

export interface DuplicateTagNameErrorData extends BaseApiErrorData {
  code: 'duplicate-tag-name';
  tagName: string;
}

export interface InternalServerErrorData extends BaseApiErrorData {
  code: 'internal-server-error';
}

export type ApiErrorData = |

