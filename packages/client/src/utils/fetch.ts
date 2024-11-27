// deno-lint-ignore-file no-explicit-any
import { cleanUrl, ClientApiError, isJson, objToQueryString } from "./index.ts";

import type {
  FetchOptions,
  FetchResponse,
  HttpMethod,
} from "../types/index.ts";

/**
 * A wrapper for the fetch API with some additional features.
 */
export class Fetch {
  protected readonly options: FetchOptions;

  protected readonly baseUrl: URL;

  constructor(options: FetchOptions = {}) {
    if (options.token) {
      this.setRequestHeaderEachRequest(
        "Authorization",
        `Bearer ${options.token}`,
      );
    }

    // Set default options
    options.dataType ||= "json";
    options.cache ||= "default";
    options.credentials ||= "same-origin";
    options.method ||= "GET";
    options.mode ||= "cors";
    options.isAjax ||= typeof options.isAjax === "boolean"
      ? options.isAjax
      : true;
    options.basePath ||= "/";

    this.baseUrl = new URL(options.basePath, options.host);

    this.options = options;
  }

  /**
   * Set header for each request
   * @param name Header name
   * @param value Header value
   */
  public setRequestHeaderEachRequest(name: string, value: string) {
    this._requestHeadersEachRequest[name] = value;
  }

  /**
   * Load data from the server using a HTTP POST request.
   * @param url A string containing the URL to which the request is sent.
   * @param data A plain object or string that is sent to the server with the request.
   * @param options Options for the request
   */
  public post<T = any, D = any>(
    url: string | URL,
    data?: D,
    options: FetchOptions = {},
  ) {
    return this.fetch<T>(url, "POST", data, options);
  }

  public delete<T = any, D = any>(
    url: string | URL,
    data?: D,
    options: FetchOptions = {},
  ) {
    return this.fetch<T>(url, "DELETE", data, options);
  }

  public put<T = any, D = any>(
    url: string | URL,
    data?: D,
    options: FetchOptions = {},
  ) {
    return this.fetch<T>(url, "PUT", data, options);
  }

  public patch<T = any, D = any>(
    url: string | URL,
    data?: D,
    options: FetchOptions = {},
  ) {
    return this.fetch<T>(url, "PATCH", data, options);
  }

  /**
   * Load data from the server using a HTTP GET request.
   * @param url A string containing the URL to which the request is sent.
   * @param data A plain object or string that is sent to the server with the request.
   * @param dataType The type of data expected from the server. Default: Intelligent Guess (xml, json, script, text, html).
   * @param options Additional options for the request
   */
  public get<T = unknown, D = any>(
    url: string | URL,
    data?: D,
    options: FetchOptions = {},
  ) {
    return this.fetch<T>(url, "GET", data, options);
  }

  /**
   * Parse the dataType to headers
   * @param dataType The type of data expected from the server. Default: Intelligent Guess (xml, json, script, text, html).
   */
  protected parseDataType(dataType?: string) {
    const headers: Record<string, string> = {};
    let contentType = "application/x-www-form-urlencoded";
    let accept = "*/*";
    switch (dataType) {
      case "script":
        contentType = "application/javascript";
        break;
      case "json":
        contentType = "application/json";
        accept = "application/json";
        break;
      case "xml":
        contentType = "application/xml";
        accept = "application/xml, text/xml";
        break;
      case "text":
        contentType = "text/plain";
        accept = "text/plain";
        break;
      case "html":
        contentType = "text/html";
        accept = "text/html";
        break;
      case "form":
        contentType = "application/x-www-form-urlencoded";
        break;
    }
    if (contentType) {
      headers["Content-Type"] = contentType;
      headers["Accept"] = accept;
    }
    return headers;
  }

  protected async fetch<T = unknown, D = any>(
    url: string | URL,
    method: HttpMethod = "GET",
    data: D,
    options: FetchOptions = {},
  ): Promise<FetchResponse<T>> {
    if (!fetch) {
      throw new Error(
        "Your platform does not support the fetch API, use xhr instead or install a polyfill.",
      );
    }

    options = { ...this.options, ...options };

    if (typeof url === "string" && url.startsWith("/")) {
      url = cleanUrl(this.options.basePath + "/" + url);
    }

    url = new URL(url, this.baseUrl);

    // Add query parameters from options.params
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value != null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const headers: Record<string, string> = {
      ...this._requestHeadersEachRequest,
      ...options.headers,
      ...this.parseDataType(options.dataType),
    };

    // This is a common technique used to identify Ajax requests.
    // The `X-Requested-With` header is not a standard HTTP header, but it is commonly used in the context of web development.
    if (!options.isAjax && !headers["X-Requested-With"]) {
      headers["X-Requested-With"] = "XMLHttpRequest";
    }

    let body = options.body;

    // If this is a GET request and there is data, add query string to url
    if (method === "GET" && data) {
      // Merge existing search params with data
      const searchParams = new URLSearchParams(url.search);
      Object.entries(objToQueryString(data)).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      url.search = searchParams.toString();
      console.debug("GET", url.href);
    } else if (data) {
      if (options.dataType === "form") {
        body = new URLSearchParams(data);
      } else {
        body = JSON.stringify(data);
      }
    }

    const response = await globalThis.fetch(url, {
      ...options,
      method,
      body,
      headers,
    });

    // Automatically parse json response
    let bodyResult = (await response.text()) as unknown as T;
    if (typeof bodyResult === "string" && isJson(bodyResult)) {
      bodyResult = JSON.parse(bodyResult);
    }

    if (typeof bodyResult === "string") {
      switch (bodyResult) {
        case "null":
          bodyResult = null as unknown as T;
          break;
        case "true":
          bodyResult = true as unknown as T;
          break;
        case "false":
          bodyResult = false as unknown as T;
          break;
        case "undefined":
          bodyResult = undefined as unknown as T;
          break;
      }
    }

    const result: FetchResponse<T> = {
      ...response,
      data: bodyResult,
      // WORKAROUND:
      ok: response.status >= 200 && response.status < 300,
    };

    // Makes it sense to throw an error if the response is not ok?
    if (!result.ok) {
      if (result.data) {
        const data = result.data as any;
        console.error("Error response", data);
        if (Array.isArray(data.errors)) {
          for (const error of data.errors) {
            console.error(JSON.stringify(error, null, 2));
          }
        }
        throw new ClientApiError(
          data.message || data.name || "Unknown error",
          { ...data, status: response.status },
        );
      }
      throw result;
    }

    return result;
  }

  /**
   * Header name value pair to send on each request
   */
  protected _requestHeadersEachRequest: Record<string, string> = {};
}
