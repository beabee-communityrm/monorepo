export interface BaseClientOptions {
  host: string;
  path?: string;
  /**
   * Optional token for authentication
   * If provided, the client will use the API key authentication method,
   * otherwise it will use the user authentication method
   */
  token?: string;
}
