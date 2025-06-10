import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import { resolve } from "path";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    env: loadEnv("test", resolve(process.cwd(), "../../"), "")
  }
});
