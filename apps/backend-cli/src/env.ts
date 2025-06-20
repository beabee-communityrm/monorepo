import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const isRunningInDocker = () => existsSync('/.dockerenv');

// This CLI is designed to be used in the docker environment but can also be used locally for testing.
// For this we need to load the .env and .env.test files.
// We do not need to load the .env files if we are inside the docker environment
// because the env variables are set in the docker compose file.
const workspaceRootPath = resolve(process.cwd() + '/../..');

let env = { ...process.env };

if (!isRunningInDocker()) {
  env = {
    ...env,
    ...dotenv.config({
      path: [workspaceRootPath + '/.env.remote'],
      override: false,
    }).parsed,
  };
  env = {
    ...env,
    ...dotenv.config({ path: [workspaceRootPath + '/.env'], override: false })
      .parsed,
  };

  if (process.env.NODE_ENV === 'test') {
    env = {
      ...env,
      ...dotenv.config({
        path: [workspaceRootPath + '/.env.test'],
        override: true,
      }).parsed,
    };
  }
}

export { env };
export default env;
