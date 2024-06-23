import { TaskRunnerWorkerService } from "@beabee/task-runner/src";
import { database } from "@beabee/core";
import { StripeSubscriptionHandler } from "./handler/stripe-subscription.handler";

import { config } from "@beabee/config";

import { log as mainLogger, optionsService } from "@beabee/core";

const log = mainLogger.child({ app: "TaskRunnerWorker" });

log.info("Initializing app...");
await database.connect();
await optionsService.reload();

const taskRunnerWorkerService = new TaskRunnerWorkerService({
  connection: {
    host: config.taskRunner.redis.host,
    port: config.taskRunner.redis.port,
  },
});

new StripeSubscriptionHandler(
  taskRunnerWorkerService,
);
