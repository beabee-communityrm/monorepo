import type {
  ApiErrorCode,
  LOGIN_CODES,
  RESET_SECURITY_FLOW_ERROR_CODE,
} from '../data';
import type { Rule } from './rule';

interface BaseApiErrorData {
  httpCode: number;
  code: ApiErrorCode;
  message: string;
}

export interface BadRequestErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.BAD_REQUEST;
}

export interface UnauthorizedErrorData extends BaseApiErrorData {
  httpCode: 401;
  code: ApiErrorCode.UNAUTHORIZED;
  subCode: LOGIN_CODES | undefined;
}

export interface NotFoundErrorData extends BaseApiErrorData {
  httpCode: 404;
  code: ApiErrorCode.NOT_FOUND;
}

export interface PaymentFailedErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.PAYMENT_FAILED;
  subCode: string;
}

export interface PaymentRequiresActionErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.PAYMENT_REQUIRES_ACTION;
  clientSecret: string;
}

export interface TooManyRequestsErrorData extends BaseApiErrorData {
  httpCode: 429;
  code: ApiErrorCode.TOO_MANY_REQUESTS;
  retryAfter: number;
}

export interface FileTooLargeErrorData extends BaseApiErrorData {
  httpCode: 413;
  code: ApiErrorCode.FILE_TOO_LARGE;
  maxSize: number | undefined;
  maxSizeDisplay: string | undefined;
}

export interface UnsupportedFileTypeErrorData extends BaseApiErrorData {
  httpCode: 415;
  code: ApiErrorCode.UNSUPPORTED_FILE_TYPE;
  type: string;
  allowedTypes: string[] | undefined;
}

export interface DuplicateIdErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.DUPLICATE_ID;
  id: string;
}

export interface DuplicateEmailErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.DUPLICATE_EMAIL;
  email: string;
}

export interface DuplicateTagNameErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.DUPLICATE_TAG_NAME;
  tagName: string;
}

export interface NoPaymentMethodErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.NO_PAYMENT_METHOD;
}

export interface CantUpdateContributionErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.CANT_UPDATE_CONTRIBUTION;
}

export type InvalidCalloutResponseCode =
  | 'only-anonymous'
  | 'expired-user'
  | 'closed'
  | 'cant-update'
  | 'guest-fields-missing'
  | 'logged-in-guest-fields'
  | 'unknown-user';

export interface InvalidCalloutResponseErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.INVALID_CALLOUT_RESPONSE;
  subCode: InvalidCalloutResponseCode;
}

export interface InvalidRuleErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.INVALID_RULE;
  rule: Rule;
}

export interface CaptchaFailedErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.CAPTCHA_FAILED;
}

export interface CaptchaRequiredErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.CAPTCHA_REQUIRED;
}

export interface InternalServerErrorData extends BaseApiErrorData {
  httpCode: 500;
  code: ApiErrorCode.INTERNAL_SERVER_ERROR;
}

export interface CantUpdateNewsletterContactErrorData extends BaseApiErrorData {
  httpCode: 500;
  code: ApiErrorCode.CANT_UPDATE_NEWSLETTER_CONTACT;
  email: string;
  status: number;
  data: any;
}

export interface FileUploadErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.FILE_UPLOAD_ERROR;
  subCode: string;
}

export interface ResetSecurityFlowErrorData extends BaseApiErrorData {
  httpCode: 400;
  code: ApiErrorCode.RESET_SECURITY_FLOW_ERROR;
  subCode: RESET_SECURITY_FLOW_ERROR_CODE;
}

export type ApiErrorData =
  | BadRequestErrorData
  | UnauthorizedErrorData
  | NotFoundErrorData
  | NoPaymentMethodErrorData
  | InvalidCalloutResponseErrorData
  | InvalidRuleErrorData
  | CaptchaFailedErrorData
  | CaptchaRequiredErrorData
  | PaymentFailedErrorData
  | PaymentRequiresActionErrorData
  | TooManyRequestsErrorData
  | FileTooLargeErrorData
  | UnsupportedFileTypeErrorData
  | DuplicateIdErrorData
  | DuplicateEmailErrorData
  | DuplicateTagNameErrorData
  | InternalServerErrorData
  | CantUpdateContributionErrorData
  | CantUpdateNewsletterContactErrorData
  | FileUploadErrorData
  | ResetSecurityFlowErrorData;
