const env = process.env;

if (!env.API_KEY) {
  throw new Error("API_KEY is not set");
}

export const API_KEY = env.API_KEY;
export const HOST = env.APP_BASE_URL || "http://localhost:4002";
export const PATH = env.API_BASE_URL || "/api/1.0";

export const TEST_USER_EMAIL = env.TEST_USER_EMAIL || "test@beabee.io";
export const TEST_USER_FIRSTNAME = env.TEST_USER_FIRSTNAME || "Test";
export const TEST_USER_LASTNAME = env.TEST_USER_LASTNAME || "Test";
export const TEST_USER_PASSWORD = env.TEST_USER_PASSWORD || "test1234";
export const TEST_USER_ROLE = env.TEST_USER_ROLE || "superadmin";
export const TEST_API_KEY_DESCRIPTION = env.TEST_API_KEY_DESCRIPTION || "api-tests";
