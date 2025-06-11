const env = process.env;

if (!env.API_KEY) {
  throw new Error('API_KEY is not set');
}

/**
 * API key for authentication with the API
 * Source: API_KEY environment variable
 * Required: Must be set, no default value
 */
export const API_KEY = env.API_KEY;

/**
 * Base URL of the application
 * Source: APP_BASE_URL environment variable
 * Default: "http://localhost:4002"
 */
export const HOST = env.APP_BASE_URL || 'http://localhost:4002';

/**
 * API base path
 * Source: API_BASE_URL environment variable
 * Default: "/api/1.0"
 */
export const PATH = env.API_BASE_URL || '/api/1.0';

/**
 * Email for test user
 * Source: TEST_USER_EMAIL environment variable
 * Default: "test@beabee.io"
 */
export const TEST_USER_EMAIL = env.TEST_USER_EMAIL || 'test@beabee.io';

/**
 * First name for test user
 * Source: TEST_USER_FIRSTNAME environment variable
 * Default: "Test"
 */
export const TEST_USER_FIRSTNAME = env.TEST_USER_FIRSTNAME || 'Test';

/**
 * Last name for test user
 * Source: TEST_USER_LASTNAME environment variable
 * Default: "Test"
 */
export const TEST_USER_LASTNAME = env.TEST_USER_LASTNAME || 'Test';

/**
 * Password for test user
 * Source: TEST_USER_PASSWORD environment variable
 * Default: "test1234"
 */
export const TEST_USER_PASSWORD = env.TEST_USER_PASSWORD || 'test1234';

/**
 * Role for test user
 * Source: TEST_USER_ROLE environment variable
 * Default: "superadmin"
 */
export const TEST_USER_ROLE = env.TEST_USER_ROLE || 'superadmin';

/**
 * Email for test user
 * Source: TEST_USER_EMAIL environment variable
 * Default: "test@beabee.io"
 */
export const TEST_RATE_LIMIT_USER_EMAIL =
  env.TEST_RATE_LIMIT_USER_EMAIL || 'rate-limit-test@beabee.io';

/**
 * First name for test user
 * Source: TEST_RATE_LIMIT_USER_FIRSTNAME environment variable
 * Default: "Test"
 */
export const TEST_RATE_LIMIT_USER_FIRSTNAME =
  env.TEST_RATE_LIMIT_USER_FIRSTNAME || 'Rate';

/**
 * Last name for test user
 * Source: TEST_RATE_LIMIT_USER_LASTNAME environment variable
 * Default: "Test"
 */
export const TEST_RATE_LIMIT_USER_LASTNAME =
  env.TEST_RATE_LIMIT_USER_LASTNAME || 'Limit';

/**
 * Password for test user
 * Source: TEST_RATE_LIMIT_USER_PASSWORD environment variable
 * Default: "test1234"
 */
export const TEST_RATE_LIMIT_USER_PASSWORD =
  env.TEST_RATE_LIMIT_USER_PASSWORD || 'rate-limit-test1234';

/**
 * Role for test user
 * Source: TEST_RATE_LIMIT_USER_ROLE environment variable
 * Default: "superadmin"
 */
export const TEST_RATE_LIMIT_USER_ROLE =
  env.TEST_RATE_LIMIT_USER_ROLE || 'superadmin';

/**
 * Description for test API key
 * Source: TEST_API_KEY_DESCRIPTION environment variable
 * Default: "api-tests"
 */
export const TEST_API_KEY_DESCRIPTION =
  env.TEST_API_KEY_DESCRIPTION || 'api-tests';
