import type { HttpMethod } from "./index.js";

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  /** The type of data expected from the server. Default is 'json' */
  dataType?: string;
  isAjax?: boolean;
  method?: HttpMethod;
  token?: string;
  host?: string;
  basePath?: string;
  params?: Record<string, any>;
}
