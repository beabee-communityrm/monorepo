export default {
  /**
   * Application base URL
   * Source: APP_BASE_URL in Docker environment or http://localhost:${VITE_DEV_SERVER_PORT} in development
   * Default: 'http://localhost:${VITE_DEV_SERVER_PORT}' in dev or replaced by APP_BASE_URL in production
   */
  appUrl: '__appUrl__',
  /**
   * The base path of the API, normally `/api/1.0`
   * Source: API_BASE_URL environment variable
   * Default: Value defined in API_BASE_URL
   */
  apiUrl: '__apiUrl__',
  /**
   * Application revision (commit hash or build ID)
   * Source: REVISION environment variable or APP_REVISION in Docker
   * Default: 'dev'
   */
  revision: '__revision__',
  /**
   * Application version
   * Source: VERSION environment variable or APP_VERSION in Docker
   * Default: 'dev'
   */
  version: '__version__',
  /**
   * AppSignal API key for error tracking
   * Source: APPSIGNAL_KEY environment variable
   * Default: '' (empty string)
   */
  appsignalKey: '__appsignalKey__',
  /**
   * CaptchaFox API key for CAPTCHA services
   * Source: CAPTCHAFOX_KEY environment variable
   * Default: '' (empty string)
   */
  captchafoxKey: '__captchafoxKey__',
  /**
   * MapTiler API key for map services
   * Source: MAPTILER_KEY environment variable
   * Default: '' (empty string)
   */
  maptilerKey: '__maptilerKey__',
  /**
   * CrowdNewsroom mode setting
   * Source: CNR_MODE environment variable
   * Default: '' (empty string)
   */
  cnrMode: '__cnrMode__',
  /**
   * Comma-separated list of experimental features to enable
   * Source: EXPERIMENTAL_FEATURES environment variable
   * Default: '' (empty string)
   */
  experimentalFeatures: '__experimentalFeatures__',
};
