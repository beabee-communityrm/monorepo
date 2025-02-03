import type { ClientApiErrorData } from "../types/index.js";

export function getErrorNameFromStatus(status: number): string {
  switch (status) {
    case 400:
      return "BadRequestError";
    case 401:
      return "UnauthorizedError";
    case 403:
      return "ForbiddenError";
    case 404:
      return "NotFoundError";
    case 409:
      return "ConflictError";
    case 422:
      return "ValidationError";
    case 429:
      return "TooManyRequestsError";
    case 500:
      return "InternalServerError";
    case 502:
      return "BadGatewayError";
    case 503:
      return "ServiceUnavailableError";
    case 504:
      return "GatewayTimeoutError";
    default:
      return status >= 500 ? "ServerError" : "ClientError";
  }
}

export class ClientApiError extends Error implements ClientApiErrorData {
  code?: string;
  errors?: {
    [key: string]: unknown;
  };
  httpCode?: number;
  name: string;

  constructor(message: string, data: ClientApiErrorData = {}) {
    super(message);
    this.code = data.code;
    this.errors = data.errors;
    this.httpCode = data.httpCode;
    this.name =
      data.name ||
      (this.httpCode ? getErrorNameFromStatus(this.httpCode) : "UnknownError");
  }
}
