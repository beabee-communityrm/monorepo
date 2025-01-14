export default async () => {
  console.log("Stopping Docker Compose environment...");

  // Stop Docker Compose Stack
  if (globalThis.__DOCKER_ENV__) {
    await globalThis.__DOCKER_ENV__.down();
  }
};
