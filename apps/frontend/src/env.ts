export default {
  /**
   * Application base URL
   *
   * Source: APP_BASE_URL environment variable (mapped from BEABEE_AUDIENCE in Docker)
   * Default: 'http://localhost:${VITE_DEV_SERVER_PORT}' in dev, APP_BASE_URL in production
   *
   * This is the public URL of the instance, used for:
   * - API proxy configuration in development
   * - Generating absolute URLs
   * - OAuth redirects
   */
  appUrl: '__appUrl__',

  /**
   * The base path of the API, normally `/api/1.0/`
   *
   * Source: API_BASE_URL environment variable
   * Default: '/api/1.0/'
   *
   * Note: The trailing slash is important for correct path resolution
   */
  apiUrl: '__apiUrl__',

  /**
   * Application revision (commit hash or build ID)
   *
   * Source: REVISION environment variable or APP_REVISION in Docker
   * Default: 'dev'
   *
   * Used for cache busting and version tracking
   */
  revision: '__revision__',

  /**
   * Application version
   *
   * Source: VERSION environment variable or APP_VERSION in Docker
   * Default: 'dev'
   *
   * Displayed in the UI and used for version checks
   */
  version: '__version__',

  /**
   * AppSignal API key for error tracking and monitoring
   *
   * Source: APPSIGNAL_KEY environment variable (mapped from BEABEE_APPSIGNAL_KEY in Docker)
   * Default: '' (empty string - disabled if not set)
   *
   * Enables client-side error tracking and performance monitoring
   */
  appsignalKey: '__appsignalKey__',

  /**
   * CaptchaFox API key for CAPTCHA services
   *
   * Source: CAPTCHAFOX_KEY environment variable (mapped from BEABEE_CAPTCHAFOX_KEY in Docker)
   * Default: '' (empty string - disabled if not set)
   * Example: sk_11111111000000001111111100000000
   *
   * Used in forms to prevent bot submissions. Must be paired with
   * BEABEE_CAPTCHAFOX_SECRET on the backend.
   */
  captchafoxKey: '__captchafoxKey__',

  /**
   * MapTiler API key for map services
   *
   * Source: MAPTILER_KEY environment variable (mapped from BEABEE_MAPTILER_KEY in Docker)
   * Default: '' (empty string - maps won't work without a valid key)
   *
   * Required for displaying interactive maps in the application
   */
  maptilerKey: '__maptilerKey__',

  /**
   * CrowdNewsroom mode flag
   *
   * Source: CNR_MODE environment variable (mapped from BEABEE_CNR_MODE in Docker)
   * Default: '' (empty string - disabled)
   *
   * Enables CrowdNewsroom specific features and UI elements
   * Set to 'true' or any non-empty value to enable
   */
  cnrMode: '__cnrMode__',
};
