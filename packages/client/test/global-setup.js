import { DockerComposeEnvironment, Wait } from "testcontainers";
import path from "node:path";

const composeFilePath = path.resolve(process.cwd() + "/../..");

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

  // Store the environment variable for the global teardown
  globalThis.__DOCKER_ENV__ = environment;
};
