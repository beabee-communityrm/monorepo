import {
  ApiErrorCode,
  ApiErrorData,
  BadRequestErrorData,
  CantUpdateContributionErrorData,
  CantUpdateNewsletterContactErrorData,
  CaptchaFailedErrorData,
  CaptchaRequiredErrorData,
  DuplicateEmailErrorData,
  DuplicateIdErrorData,
  DuplicateTagNameErrorData,
  FileTooLargeErrorData,
  FileUploadErrorData,
  InternalServerErrorData,
  InvalidCalloutResponseCode,
  InvalidCalloutResponseErrorData,
  InvalidRuleErrorData,
  LOGIN_CODES,
  NoPaymentMethodErrorData,
  NotFoundErrorData,
  PaymentFailedErrorData,
  PaymentRequiresActionErrorData,
  RESET_SECURITY_FLOW_ERROR_CODE,
  ResetSecurityFlowErrorData,
  Rule,
  TooManyRequestsErrorData,
  UnauthorizedErrorData,
  UnsupportedFileTypeErrorData,
} from '@beabee/beabee-common';

export abstract class ApiError extends Error {
  abstract readonly httpCode: number;
  abstract readonly code: ApiErrorCode;

  static fromData(data: ApiErrorData): ApiError {
    switch (data.code) {
      case ApiErrorCode.BAD_REQUEST:
        return new BadRequestError(data.message);
      case ApiErrorCode.UNAUTHORIZED:
        return new UnauthorizedError(data.message, data.subCode);
      case ApiErrorCode.NOT_FOUND:
        return new NotFoundError(data.message);
      case ApiErrorCode.PAYMENT_FAILED:
        return new PaymentFailedError(data.message, data.subCode);
      case ApiErrorCode.PAYMENT_REQUIRES_ACTION:
        return new PaymentRequiresActionError(data.message, data.clientSecret);
      case ApiErrorCode.TOO_MANY_REQUESTS:
        return new TooManyRequestsError(data.message, data.retryAfter);
      case ApiErrorCode.FILE_TOO_LARGE:
        return new FileTooLargeError(
          data.message,
          data.maxSize,
          data.maxSizeDisplay
        );
      case ApiErrorCode.UNSUPPORTED_FILE_TYPE:
        return new UnsupportedFileTypeError(
          data.message,
          data.type,
          data.allowedTypes
        );
      case ApiErrorCode.DUPLICATE_ID:
        return new DuplicateIdError(data.message, data.id);
      case ApiErrorCode.DUPLICATE_EMAIL:
        return new DuplicateEmailError(data.message, data.email);
      case ApiErrorCode.DUPLICATE_TAG_NAME:
        return new DuplicateTagNameError(data.message, data.tagName);
      case ApiErrorCode.NO_PAYMENT_METHOD:
        return new NoPaymentMethodError(data.message);
      case ApiErrorCode.CANT_UPDATE_CONTRIBUTION:
        return new CantUpdateContributionError(data.message);
      case ApiErrorCode.INVALID_CALLOUT_RESPONSE:
        return new InvalidCalloutResponseError(data.message, data.subCode);
      case ApiErrorCode.INVALID_RULE:
        return new InvalidRuleError(data.message, data.rule);
      case ApiErrorCode.CAPTCHA_FAILED:
        return new CaptchaFailedError(data.message);
      case ApiErrorCode.CAPTCHA_REQUIRED:
        return new CaptchaRequiredError(data.message);
      case ApiErrorCode.INTERNAL_SERVER_ERROR:
        return new InternalServerError(data.message);
      case ApiErrorCode.CANT_UPDATE_NEWSLETTER_CONTACT:
        return new CantUpdateNewsletterContactError(
          data.message,
          data.email,
          data.status,
          data.data
        );
      case ApiErrorCode.FILE_UPLOAD_ERROR:
        return new FileUploadError(data.message, data.subCode);
      case ApiErrorCode.RESET_SECURITY_FLOW_ERROR:
        return new ResetSecurityFlowError(data.message, data.subCode);
    }
  }
}

export class BadRequestError extends ApiError implements BadRequestErrorData {
  readonly httpCode = 400;
  readonly code = ApiErrorCode.BAD_REQUEST;
}

export class UnauthorizedError
  extends ApiError
  implements UnauthorizedErrorData
{
  readonly httpCode = 401;
  readonly code = ApiErrorCode.UNAUTHORIZED;

  constructor(
    message: string,
    public readonly subCode: LOGIN_CODES | undefined
  ) {
    super(message);
  }
}

export class NotFoundError extends ApiError implements NotFoundErrorData {
  readonly httpCode = 404;
  readonly code = ApiErrorCode.NOT_FOUND;
}

export class PaymentFailedError
  extends ApiError
  implements PaymentFailedErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.PAYMENT_FAILED;

  constructor(
    message: string,
    public readonly subCode: string
  ) {
    super(message);
  }
}

export class PaymentRequiresActionError
  extends ApiError
  implements PaymentRequiresActionErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.PAYMENT_REQUIRES_ACTION;

  constructor(
    message: string,
    public readonly clientSecret: string
  ) {
    super(message);
  }
}

export class TooManyRequestsError
  extends ApiError
  implements TooManyRequestsErrorData
{
  readonly httpCode = 429;
  readonly code = ApiErrorCode.TOO_MANY_REQUESTS;

  constructor(
    message: string,
    public readonly retryAfter: number
  ) {
    super(message);
  }
}

export class FileTooLargeError
  extends ApiError
  implements FileTooLargeErrorData
{
  readonly httpCode = 413;
  readonly code = ApiErrorCode.FILE_TOO_LARGE;

  constructor(
    message: string,
    public readonly maxSize: number | undefined = undefined,
    public readonly maxSizeDisplay: string | undefined = undefined
  ) {
    super(message);
  }
}

export class UnsupportedFileTypeError
  extends ApiError
  implements UnsupportedFileTypeErrorData
{
  readonly httpCode = 415;
  readonly code = ApiErrorCode.UNSUPPORTED_FILE_TYPE;

  constructor(
    message: string,
    public readonly type: string,
    public readonly allowedTypes: string[] | undefined = undefined
  ) {
    super(message);
  }
}

export class DuplicateIdError extends ApiError implements DuplicateIdErrorData {
  readonly httpCode = 400;
  readonly code = ApiErrorCode.DUPLICATE_ID;

  constructor(
    message: string,
    public readonly id: string
  ) {
    super(message);
  }
}

export class DuplicateEmailError
  extends ApiError
  implements DuplicateEmailErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.DUPLICATE_EMAIL;

  constructor(
    message: string,
    public readonly email: string
  ) {
    super(message);
  }
}

export class DuplicateTagNameError
  extends ApiError
  implements DuplicateTagNameErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.DUPLICATE_TAG_NAME;

  constructor(
    message: string,
    public readonly tagName: string
  ) {
    super(message);
  }
}

export class NoPaymentMethodError
  extends ApiError
  implements NoPaymentMethodErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.NO_PAYMENT_METHOD;
}

export class CantUpdateContributionError
  extends ApiError
  implements CantUpdateContributionErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.CANT_UPDATE_CONTRIBUTION;
}

export class InvalidCalloutResponseError
  extends ApiError
  implements InvalidCalloutResponseErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.INVALID_CALLOUT_RESPONSE;

  constructor(
    message: string,
    public readonly subCode: InvalidCalloutResponseCode
  ) {
    super(message);
  }
}

export class InvalidRuleError extends ApiError implements InvalidRuleErrorData {
  readonly httpCode = 400;
  readonly code = ApiErrorCode.INVALID_RULE;

  constructor(
    message: string,
    public readonly rule: Rule
  ) {
    super(message);
  }
}

export class InternalServerError
  extends ApiError
  implements InternalServerErrorData
{
  readonly httpCode = 500;
  readonly code = ApiErrorCode.INTERNAL_SERVER_ERROR;
}

export class CantUpdateNewsletterContactError
  extends ApiError
  implements CantUpdateNewsletterContactErrorData
{
  readonly httpCode = 500;
  readonly code = ApiErrorCode.CANT_UPDATE_NEWSLETTER_CONTACT;

  constructor(
    message: string,
    public readonly email: string,
    public readonly status: number,
    public readonly data: any
  ) {
    super(message);
  }
}

class FileUploadError extends ApiError implements FileUploadErrorData {
  readonly httpCode = 400;
  readonly code = ApiErrorCode.FILE_UPLOAD_ERROR;

  constructor(
    message: string,
    public readonly subCode: string
  ) {
    super(message);
  }
}

export class ResetSecurityFlowError
  extends ApiError
  implements ResetSecurityFlowErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.RESET_SECURITY_FLOW_ERROR;

  constructor(
    message: string,
    public readonly subCode: RESET_SECURITY_FLOW_ERROR_CODE
  ) {
    super(message);
  }
}

export class CaptchaFailedError
  extends ApiError
  implements CaptchaFailedErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.CAPTCHA_FAILED;
}

export class CaptchaRequiredError
  extends ApiError
  implements CaptchaRequiredErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.CAPTCHA_REQUIRED;
}
