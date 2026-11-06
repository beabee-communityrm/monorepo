export interface ContentSystemData {
  /**
   * Origins allowed to embed the app, call the API with credentials and be
   * redirected to after login, in addition to those set by the environment
   */
  trustedOrigins: string[];
}
