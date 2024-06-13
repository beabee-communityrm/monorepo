import { Express } from "express";

import { database as db } from "@beabee/core";

import { optionsService, networkCommunicatorService, log as mainLogger } from "@beabee/core";

const log = mainLogger.child({ app: "server" });

export async function initApp() {
  log.info("Initializing app...");
  await db.connect();
  await optionsService.reload();
}

export function startServer(app: Express) {
  log.info("Starting server...");

  app.set("trust proxy", true);

  const server = app.listen(3000);
  networkCommunicatorService.startServer();

  process.on("SIGTERM", () => {
    log.debug("Waiting for server to shutdown");
    server.close();
    db.close();

    setTimeout(() => {
      log.warn("Server was forced to shutdown after timeout");
      process.exit(1);
    }, 20000).unref();
  });
}

export async function runApp(fn: () => Promise<void>) {
  try {
    await initApp();
    await fn();
  } catch (err) {
    log.error("Uncaught error", err);
  }
  await db.close();
}
