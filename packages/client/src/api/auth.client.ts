import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import type { BaseClientOptions } from "../types/index.js";
import type { LoginData } from "@beabee/beabee-common";

/**
 * Client for managing authentication operations
 * Handles login and logout
 * @extends BaseClient
 */
export class AuthClient extends BaseClient {
  /**
   * Creates a new authentication client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/auth");
    super(options);
  }

  /**
   * Authenticates a user with credentials
   * @param data - Login credentials including email, password and optional 2FA token
   * @returns Promise that resolves when login is successful
   */
  async login(data: LoginData): Promise<void> {
    await this.fetch.post("login", {
      email: data.email,
      password: data.password,
      token: data.token,
    });
  }

  /**
   * Logs out the current user
   * Ends the user session and removes authentication
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    await this.fetch.post("logout");
  }
}
