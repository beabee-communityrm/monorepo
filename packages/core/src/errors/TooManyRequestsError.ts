import { HttpError } from 'routing-controllers';

/**
 * Custom error for HTTP 429 Too Many Requests responses.
 */
export class TooManyRequestsError extends HttpError {
  httpCode = 429;
  code = 'TOO_MANY_REQUESTS';
  errors?: Record<string, any>;

  constructor(
    options: {
      message?: string;
      errors?: Record<string, any>;
    } = {}
  ) {
    super(429, options.message || 'Too Many Requests');
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
    this.name = 'TooManyRequestsError';

    if (options.errors) {
      this.errors = options.errors;
    }
  }
}
