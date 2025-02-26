import { DockerComposeEnvironment, Wait } from "testcontainers";
import path from "node:path";
import dotenv from "dotenv";

import type { StartedDockerComposeEnvironment } from "testcontainers";

const rootPath = path.resolve(process.cwd() + "/../..");
const envDev = dotenv.config({ path: [rootPath + "/.env"], override: false });
const envTest = dotenv.config({
  path: [rootPath + "/.env.test"],
  override: true,
});
const env = { ...envDev.parsed, ...envTest.parsed };

const testUserEmail = env.TEST_USER_EMAIL;
const createTestUserCommand = `yarn backend-cli user create --firstname ${env.TEST_USER_FIRSTNAME} --lastname ${env.TEST_USER_LASTNAME} --email ${testUserEmail} --password ${env.TEST_USER_PASSWORD} --role ${env.TEST_USER_ROLE}`;
const createTestApiKeyCommand = `yarn backend-cli api-key create --description ${env.TEST_API_KEY_DESCRIPTION} --email ${testUserEmail}`;

// Create test payments with different amounts and periods (at least 10 for pagination)
const createTestPaymentsCommands = [
  // Create payments with different amounts and periods
  `yarn backend-cli payment create --email ${testUserEmail} --amount 10 --period monthly`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 20 --period monthly`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 30 --period monthly`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 40 --period monthly`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 50 --period monthly`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 60 --period annually`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 70 --period annually`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 80 --period annually`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 90 --period annually`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 100 --period annually`,
];

const apiAppLogs = {
  data: [] as string[],
  err: [] as string[],
};

let startedDockerComposeEnvironment: StartedDockerComposeEnvironment | null =
  null;

export async function setup() {
  console.log("Starting Docker Compose environment...");

  startedDockerComposeEnvironment = await new DockerComposeEnvironment(
    rootPath,
    "docker-compose.test.yml",
  )
    .withEnvironment(env)
    .withProjectName(env.COMPOSE_PROJECT_NAME || "beabee-test")
    .withWaitStrategy(
      "db",
      Wait.forLogMessage(/database system is ready to accept connections/),
    )
    .withWaitStrategy(
      "api_app",
      Wait.forLogMessage(/Server is ready and listening on port 3000/),
    )
    .up([
      "db",
      "migration",
      "api_app",
      "app_router",
      "webhook_app",
      "stripe_cli",
    ]);

  const apiApp = startedDockerComposeEnvironment.getContainer("api_app-1");

  // Log the apiApp logs
  (await apiApp.logs())
    .on("data", (line) => apiAppLogs.data.push(line))
    .on("err", (line) => apiAppLogs.err.push(line))
    .on("end", () => console.log("Stream closed"));

  // Create test user
  await apiApp.exec(createTestUserCommand.split(" "));

  // Create test API key
  const apiKeyOutput = await apiApp.exec(createTestApiKeyCommand.split(" "));

  const token = apiKeyOutput.output.match(/Token: (.+)/)?.[1];
  if (token) {
    console.log("Test API key created:", token);
    process.env.API_KEY = token.trim();
  } else {
    throw new Error("Failed to create test API key: " + apiKeyOutput.output);
  }

  // Create test payments
  console.log("Creating test payments...");
  for (const command of createTestPaymentsCommands) {
    await apiApp.exec(command.split(" "));
  }
}

export async function teardown() {
  console.log("Tearing down Docker Compose environment...");
  if (startedDockerComposeEnvironment) {
    await startedDockerComposeEnvironment.down();
  }

  // Log the apiApp logs, not set by default
  if (env.DEBUG_LOGS) {
    if (apiAppLogs.data.length > 0) {
      console.log("API App data logs:", apiAppLogs.data);
    }
    if (apiAppLogs.err.length > 0) {
      console.log("API App error logs:", apiAppLogs.err);
    }
  }
}
