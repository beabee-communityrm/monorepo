import type { HttpMethod } from "./index.js";

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  /** The type of data expected from the server. Default is 'json' */
  dataType?: string;
  isAjax?: boolean;
  method?: HttpMethod;
  /**
   * Optional token for authentication
   * If provided, the client will use the API key authentication method,
   * otherwise it will use the user authentication method
   */
  token?: string;
  host?: string;
  basePath?: string;
  params?: Record<string, any>;
}
