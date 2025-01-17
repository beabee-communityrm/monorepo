import { describe, expect, it, beforeAll } from "vitest";
import { AuthClient, ClientApiError } from "@beabee/client";
import type { LoginData } from "@beabee/beabee-common";

import { API_KEY, HOST, PATH, TEST_USER_EMAIL, TEST_USER_FIRSTNAME, TEST_USER_LASTNAME, TEST_USER_PASSWORD, TEST_USER_ROLE } from "./utils/env.js";

describe("Auth API", () => {
  let authClient: AuthClient;

  beforeAll(() => {
    console.log("HOST", HOST);
    console.log("PATH", PATH);
    console.log("API_KEY", API_KEY);
    authClient = new AuthClient({
      host: HOST,
      path: PATH,
      token: API_KEY
    });
  });

  it("should login with test user credentials", async () => {
    const validLoginData: LoginData = {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    };
    await authClient.login(validLoginData);
  });

  it("should fail login with invalid credentials", async () => {
    const invalidLoginData: LoginData = {
      email: "nonexistent@example.com",
      password: "wrongpassword",
      token: ""
    };

    try {
      await authClient.login(invalidLoginData);
      // If we reach this point, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ClientApiError);
      if (error instanceof ClientApiError) {
        expect(error.httpCode).toBe(404);
      }
    }
  });

  it("should successfully logout", async () => {
    try {
      await authClient.logout();
      expect(true).toBe(true); // If we reach this point without error, the test passes
    } catch (error) {
      console.log(error);
      // If we reach this point, the test should fail
      expect(true).toBe(false);
    }
  });
}); 
