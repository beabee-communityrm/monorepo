import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],

    globalSetup: ["@beabee/test-utils/vitest/docker-compose-setup"],

    environment: "node"
  }
});
