import { DockerComposeEnvironment, Wait } from "testcontainers";
import path from "node:path";

const composeFilePath = path.resolve(process.cwd() + "/../..");
const testUserEmail = "test@beabee.io";
const createTestUserCommand = `yarn backend-cli user create --firstname Test --lastname Test --email ${testUserEmail}`;
const createTestApiKeyCommand = `yarn backend-cli api-key create --description api-tests --email ${testUserEmail}`;

export default async () => {
  console.log("Starting Docker Compose environment...");

  // Start Docker Compose Stack
  const environment = await new DockerComposeEnvironment(
    composeFilePath,
    "docker-compose.test.yml"
  )
    .withWaitStrategy(
      "db",
      Wait.forLogMessage(/database system is ready to accept connections/)
    )
    .withWaitStrategy(
      "api_app",
      Wait.forLogMessage(/Server is ready and listening on port 3000/)
    )
    .up(["db", "migration", "api_app", "app_router"]);

  const apiApp = environment.getContainer("api_app-1");

  // Create test user
  await apiApp.exec(createTestUserCommand.split(" "));

  // Create test API key
  const apiKeyOutput = await apiApp.exec(createTestApiKeyCommand.split(" "));

  const token = apiKeyOutput.output.match(/Token: (.+)/)?.[1];
  if (token) {
    console.log("Test API key created:", token);
    process.env.API_KEY = token.trim();
  }

  // Store the environment variable for the global teardown
  globalThis.__DOCKER_ENV__ = environment;
};
