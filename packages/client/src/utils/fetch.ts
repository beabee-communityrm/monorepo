import type {
  FetchOptions,
  FetchResponse,
  HttpMethod,
} from '../types/index.js';
import {
  ClientApiError,
  CookiePolyfill,
  cleanUrl,
  hasProtocol,
  isJson,
  queryStringify,
} from './index.js';

/**
 * A wrapper for the fetch API with some additional features.
 */
export class Fetch {
  protected readonly options: FetchOptions;
  protected errorHandlers: ((error: ClientApiError) => void)[] = [];

  constructor(options: FetchOptions = {}) {
    if (options.token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${options.token}`,
      };
      options.credentials ||= 'same-origin';
    } else {
      options.credentials ||= 'include';
    }

    // Set default options
    options.dataType ||= 'json';
    options.cache ||= 'default';
    options.method ||= 'GET';
    options.mode ||= 'cors';
    options.isAjax ||=
      typeof options.isAjax === 'boolean' ? options.isAjax : true;
    options.basePath ||= '/';

    this.options = options;
  }

  /**
   * Load data from the server using a HTTP POST request.
   * @param url A string containing the URL to which the request is sent.
   * @param data The data to be sent in the request body
   * @param options Additional options for the request
   * @param options.params Object containing URL query parameters. These are always converted to URL query parameters,
   *                      while data goes into the request body.
   */
  public post<T = any, D = any>(
    url: string | URL,
    data?: D,
    options: FetchOptions = {}
  ) {
    return this.fetch<T>(url, 'POST', data, options);
  }

  /**
   * Delete a resource on the server using a HTTP DELETE request.
   * @param url A string containing the URL to which the request is sent.
   * @param data The data to be sent in the request body
   * @param options Additional options for the request
   * @param options.params Object containing URL query parameters. These are always converted to URL query parameters,
   *                      while data goes into the request body.
   */
  public delete<T = any, D = any>(
    url: string | URL,
    data?: D,
    options: FetchOptions = {}
  ) {
    return this.fetch<T>(url, 'DELETE', data, options);
  }

  /**
   * Update a resource on the server using a HTTP PUT request.
   * Use this when you want to replace an entire resource.
   * @param url A string containing the URL to which the request is sent.
   * @param data The data to be sent in the request body
   * @param options Additional options for the request
   * @param options.params Object containing URL query parameters. These are always converted to URL query parameters,
   *                      while data goes into the request body.
   */
  public put<T = any, D = any>(
    url: string | URL,
    data?: D,
    options: FetchOptions = {}
  ) {
    return this.fetch<T>(url, 'PUT', data, options);
  }

  /**
   * Update a resource on the server using a HTTP PATCH request.
   * Use this when you want to apply partial modifications to a resource.
   * @param url A string containing the URL to which the request is sent.
   * @param data The data to be sent in the request body
   * @param options Additional options for the request
   * @param options.params Object containing URL query parameters. These are always converted to URL query parameters,
   *                      while data goes into the request body.
   */
  public patch<T = any, D = any>(
    url: string | URL,
    data?: D,
    options: FetchOptions = {}
  ) {
    return this.fetch<T>(url, 'PATCH', data, options);
  }

  /**
   * Load data from the server using a HTTP GET request.
   * @param url A string containing the URL to which the request is sent.
   * @param data For GET requests, this will be converted to URL query parameters along with options.params.
   *             This is useful for backward compatibility and convenience, since GET requests cannot have a body.
   * @param options Additional options for the request
   * @param options.params Object containing URL query parameters. These are always converted to URL query parameters
   *                      regardless of the HTTP method. For non-GET requests, only options.params are added to the URL,
   *                      while data goes into the request body.
   */
  public get<T = unknown, D = any>(
    url: string | URL,
    data?: D,
    options: FetchOptions = {}
  ) {
    return this.fetch<T>(url, 'GET', data, options);
  }

  /**
   * Parse the dataType to headers
   * @param dataType The type of data expected from the server. Default: Intelligent Guess (xml, json, script, text, html).
   */
  protected parseDataType(dataType?: string) {
    const headers: Record<string, string> = {};
    let contentType: string | undefined = undefined;
    let accept = '*/*';
    switch (dataType) {
      case 'script':
        contentType = 'application/javascript';
        break;
      case 'json':
        contentType = 'application/json';
        accept = 'application/json';
        break;
      case 'xml':
        contentType = 'application/xml';
        accept = 'application/xml, text/xml';
        break;
      case 'text':
        contentType = 'text/plain';
        accept = 'text/plain';
        break;
      case 'html':
        contentType = 'text/html';
        accept = 'text/html';
        break;
      case 'form':
      case 'multipart':
        // Remove Content-Type so browser can set it with boundary
        contentType = undefined;
        break;
    }

    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    if (accept) {
      headers['Accept'] = accept;
    }
    return headers;
  }

  /**
   * Add a global error handler
   * @param handler Function to handle errors
   */
  public onError(handler: (error: ClientApiError) => void): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Core fetch method that handles all HTTP requests
   * @param url The URL to which the request is sent
   * @param method The HTTP method to use (GET, POST, PUT, DELETE, etc.)
   * @param data The data to be processed:
   *        - For GET requests: Converted to URL parameters along with options.params
   *          since GET requests cannot have a body
   *        - For other methods: Sent as request body, while only options.params
   *          are converted to URL parameters
   * @param options Additional options for the request
   * @param options.params Object containing URL query parameters. These are always
   *                      converted to URL parameters regardless of HTTP method.
   *                      This separation allows for consistent URL parameter handling
   *                      across all HTTP methods.
   * @returns Promise resolving to the fetch response with parsed data
   * @template T Type of the expected response data
   * @template D Type of the request data
   */
  protected async fetch<T = unknown, D = any>(
    url: string | URL,
    method: HttpMethod = 'GET',
    data: D | {} = {},
    options: FetchOptions = {}
  ): Promise<FetchResponse<T>> {
    try {
      return await this.performFetch<T, D>(url, method, data, options);
    } catch (error) {
      if (error instanceof ClientApiError) {
        // Notify all error handlers
        this.errorHandlers.forEach((handler) => handler(error));
      }
      throw error;
    }
  }

  // Rename existing fetch implementation to performFetch
  protected async performFetch<T = unknown, D = any>(
    url: string | URL,
    method: HttpMethod = 'GET',
    data: D | {} = {},
    options: FetchOptions = {}
  ): Promise<FetchResponse<T>> {
    if (!fetch) {
      throw new Error(
        'Your platform does not support the fetch API, please install a polyfill.'
      );
    }

    options = { ...this.options, ...options };
    options.params ||= {};

    // Use basePath if url does not have a protocol
    if (typeof url === 'string' && !hasProtocol(url)) {
      url = cleanUrl(options.basePath + '/' + url);
    }

    url = new URL(url, this.options.host);

    const headers: Record<string, string> = {
      ...this.options.headers,
      ...options.headers,
      ...this.parseDataType(options.dataType),
    };

    // Handle cookies with polyfill
    if (CookiePolyfill.shouldBeUsed(options.credentials)) {
      const cookies = CookiePolyfill.get();
      if (cookies.length > 0) {
        headers['Cookie'] = cookies.join('; ');
      }
    }

    // This is a common technique used to identify Ajax requests.
    // The `X-Requested-With` header is not a standard HTTP header, but it is commonly used in the context of web development.
    if (options.isAjax && !headers['X-Requested-With']) {
      headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    let body = options.body;

    /**
     * Handle query parameters:
     * - For GET requests: Both options.params and data are converted to URL parameters
     *   since GET requests cannot have a body, and this provides a consistent API
     *   with other HTTP methods while maintaining backward compatibility.
     * - For other HTTP methods: Only options.params are added to URL parameters,
     *   while data goes into the request body.
     */
    if (method === 'GET') {
      // For GET requests, merge options.params and data into query string
      const queryParams = {
        ...options.params,
        ...data,
      };
      if (Object.keys(queryParams).length > 0) {
        url.search = queryStringify(queryParams);
      }
    } else {
      // For non-GET requests
      // Add query parameters from options.params if any
      if (Object.keys(options.params).length > 0) {
        url.search = queryStringify(options.params);
      }
      // Handle body data
      if (data) {
        if (options.dataType === 'form' || options.dataType === 'multipart') {
          if (data instanceof FormData) {
            body = data;
          } else {
            body = new URLSearchParams(data as any);
          }
        } else {
          body = JSON.stringify(data);
        }
      }
    }

    const response = await globalThis.fetch(url, {
      ...options,
      method,
      body,
      headers,
    });

    // Store cookies from response
    if (CookiePolyfill.shouldBeUsed(options.credentials)) {
      const setCookieHeaders = response.headers.getSetCookie();
      if (setCookieHeaders?.length > 0) {
        CookiePolyfill.store(setCookieHeaders);
      }
    }

    // Automatically parse json response
    let bodyResult = (await response.text()) as unknown;
    if (typeof bodyResult === 'string' && isJson(bodyResult)) {
      bodyResult = JSON.parse(bodyResult);
    }

    if (typeof bodyResult === 'string') {
      switch (bodyResult) {
        case 'null':
        case '': // FIXME: Does the server interpret `null` as an empty string?
          bodyResult = null;
          break;
        case 'true':
          bodyResult = true;
          break;
        case 'false':
          bodyResult = false;
          break;
        case 'undefined':
          bodyResult = undefined;
          break;
      }
    }

    const result: FetchResponse<T> = {
      ...response,
      data: bodyResult as T,
      ok: response.status >= 200 && response.status < 400,
    };

    // Makes it sense to throw an error if the response is not ok
    if (!result.ok) {
      if (result.data) {
        const data = result.data as any;
        console.error('Error response', data);
        if (Array.isArray(data.errors)) {
          for (const error of data.errors) {
            console.error(JSON.stringify(error, null, 2));
          }
        }
        // Extract Retry-After header (seconds) if present
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterSeconds = retryAfterHeader
          ? Number.parseInt(retryAfterHeader, 10)
          : undefined;

        throw new ClientApiError(data.message || 'Unknown error', {
          ...data,
          httpCode: response.status,
          retryAfterSeconds,
        });
      }
      throw result;
    }

    return result;
  }

  /**
   * Clear stored cookies
   */
  public clearCookies(): void {
    if (CookiePolyfill.shouldBeUsed(this.options.credentials)) {
      CookiePolyfill.clear();
    }
  }

  /**
   * Header name value pair to send on each request
   */
  protected _requestHeadersEachRequest: Record<string, string> = {};
}
