export interface ClientApiErrorData {
  code?: string;
  errors?: {
    [key: string]: unknown;
  };
  httpCode?: number;
}
