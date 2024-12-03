import type { ClientApiErrorData } from "../deps.js";

export class ClientApiError extends Error implements ClientApiErrorData {
  code?: string;
  errors?: {
    [key: string]: unknown;
  };
  httpCode?: number;

  constructor(message: string, data: ClientApiErrorData = {}) {
    super(message);
    this.code = data.code;
    this.errors = data.errors;
    this.httpCode = data.httpCode;
  }
}
