export type WeblateClientOptions = {
  /**
   * The base URL of the Weblate API
   * Example: https://hosted.weblate.org/api/
   */
  baseUrl: string;
  /**
   * The API token to use for authentication
   * Example: "your-api-token"
   */
  token?: string;

  /**
   * The project to use for the client
   * Example: "beabee"
   */
  project: string;

  /**
   * The component to use for the client
   * Example: "platform"
   */
  component: string;
};
