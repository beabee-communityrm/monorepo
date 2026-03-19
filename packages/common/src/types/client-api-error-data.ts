// TODO: Use this in the backend too to make it consistent
export interface ClientApiErrorData {
  httpCode: number;
  code: string;
  message?: string;
  errors?: {
    [key: string]: unknown;
  };
}
