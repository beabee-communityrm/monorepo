import { describe, expect, it, beforeAll } from "vitest";
import { HealthClient } from "@beabee/client";
import { API_KEY, HOST, PATH } from "@beabee/test-utils/vitest/env";

describe("Health API", () => {
  let healthClient: HealthClient;

  beforeAll(() => {
    healthClient = new HealthClient({
      host: HOST,
      path: PATH,
      token: API_KEY
    });
  });

  describe("check", () => {
    it("should return health status", async () => {
      const health = await healthClient.check();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(["ok", "error"]).toContain(health.status);
      expect(health.timestamp).toBeInstanceOf(Date);
      expect(health.services).toBeDefined();
      expect(typeof health.services.database).toBe("boolean");
    });

    it("should return ok status when API is healthy", async () => {
      const health = await healthClient.check();

      // Assuming the API is healthy during tests
      expect(health.status).toBe("ok");
      expect(health.services.database).toBe(true);
    });
  });
});
