import { DockerComposeEnvironment, type StartedDockerComposeEnvironment, Wait } from "testcontainers";
import path from "node:path";
import dotenv from "dotenv";

const rootPath = path.resolve(process.cwd() + "/../..");
const envDev = dotenv.config({ path: [rootPath + "/.env"], override: false });
const envTest = dotenv.config({ path: [rootPath + "/.env.test"], override: true });
const env = { ...envDev.parsed, ...envTest.parsed };

const testUserEmail = "test@beabee.io";
const createTestUserCommand = `yarn backend-cli user create --firstname Test --lastname Test --email ${testUserEmail}`;
const createTestApiKeyCommand = `yarn backend-cli api-key create --description api-tests --email ${testUserEmail}`;

let startedDockerComposeEnvironment: StartedDockerComposeEnvironment | null = null;

export async function setup() {
  console.log("Starting Docker Compose environment...");

  startedDockerComposeEnvironment = await new DockerComposeEnvironment(
    rootPath,
    "docker-compose.test.yml"
  )
    .withEnvironment(env)
    .withProjectName(env.COMPOSE_PROJECT_NAME || "beabee-test")
    .withWaitStrategy(
      "db",
      Wait.forLogMessage(/database system is ready to accept connections/)
    )
    .withWaitStrategy(
      "api_app",
      Wait.forLogMessage(/Server is ready and listening on port 3000/)
    )
    .up(["db", "migration", "api_app", "app_router"]);

  const apiApp = startedDockerComposeEnvironment.getContainer("api_app-1");

  await apiApp.exec(createTestUserCommand.split(" "));

  const apiKeyOutput = await apiApp.exec(createTestApiKeyCommand.split(" "));

  const token = apiKeyOutput.output.match(/Token: (.+)/)?.[1];
  if (token) {
    console.log("Test API key created:", token);
    process.env.API_KEY = token.trim();
  }
} 

export async function teardown() {
  console.log("Tearing down Docker Compose environment...");
  if (startedDockerComposeEnvironment) {
    await startedDockerComposeEnvironment.down();
  }
}
