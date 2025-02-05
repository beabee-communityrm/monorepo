import dotenv from "dotenv";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const isRunningInDocker = () => existsSync("/.dockerenv");

// This CLI is designed to be used in the docker environment but can also be used locally for testing.
// For this we need to load the .env, core package .env and .env.test files.
// We do not need to load the .env.test files if we are inside the docker environment
// because the env variables are set in the docker compose file.
const workspaceRootPath = resolve(process.cwd() + "/../..");

let env = { ...process.env };

if (!isRunningInDocker()) {
  env = {
    ...env,
    ...dotenv.config({
      path: [workspaceRootPath + "/.env.cli"],
      override: false
    }).parsed
  };
  env = {
    ...env,
    ...dotenv.config({
      path: [workspaceRootPath + "/packages/core/.env"],
      override: false
    }).parsed
  };
  env = {
    ...env,
    ...dotenv.config({ path: [workspaceRootPath + "/.env"], override: false })
      .parsed
  };

  if (process.env.NODE_ENV === "test") {
    env = {
      ...env,
      ...dotenv.config({
        path: [workspaceRootPath + "/.env.test"],
        override: true
      }).parsed
    };
    env = {
      ...env,
      ...dotenv.config({
        path: [workspaceRootPath + "/.env.cli-test"],
        override: true
      }).parsed
    };
  }
}

export { env };
export default env;
