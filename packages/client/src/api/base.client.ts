import { Fetch, parseISO } from "../utils/index.js";
import type { BaseClientOptions } from "../types/index.js";

/**
 * Abstract base class for all API clients
 * Provides common functionality for HTTP requests and data serialization
 */
export abstract class BaseClient {
  /** Instance of the Fetch utility for making HTTP requests */
  readonly fetch: Fetch;

  /**
   * Creates a new base client instance
   * @param options - Configuration options for the client
   * @param options.path - Base path for API endpoints
   * @param options.host - API host URL
   * @param options.token - Authentication token
   */
  constructor(protected readonly options: BaseClientOptions) {
    this.fetch = new Fetch({
      ...options,
      basePath: options.path
    });
  }

  /**
   * Utility method to deserialize date strings into Date objects
   * Handles both ISO date strings and existing Date objects
   * @param s - Date string or Date object to deserialize
   * @returns Deserialized Date object or null/undefined if input is null/undefined
   */
  static deserializeDate(s: string | Date): Date;
  static deserializeDate<T extends null | undefined>(
    s: string | Date | T
  ): Date | T;
  static deserializeDate<T extends null | undefined>(
    s: string | Date | T
  ): Date | T {
    if (s instanceof Date) {
      return s;
    }
    return s == null ? s : parseISO(s);
  }
}
