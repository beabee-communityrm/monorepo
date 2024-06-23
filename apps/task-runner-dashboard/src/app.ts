import { createDashboard } from "./dashboard";
import { TaskRunnerQueueService } from "@beabee/task-runner/src";

const TASK_RUNNER_REDIS_HOST = process.env.TASK_RUNNER_REDIS_HOST ||
  "localhost";
const TASK_RUNNER_REDIS_PORT = Number(process.env.TASK_RUNNER_REDIS_PORT) ||
  6379;
const TASK_RUNNER_DASHBOARD_PORT =
  Number(process.env.TASK_RUNNER_DASHBOARD_PORT) || 3004;
const TASK_RUNNER_DASHBOARD_ROUTE_PREFIX =
  process.env.TASK_RUNNER_DASHBOARD_ROUTE_PREFIX || "/";

const taskRunnerQueueService = new TaskRunnerQueueService({
  connection: {
    host: TASK_RUNNER_REDIS_HOST,
    port: TASK_RUNNER_REDIS_PORT,
  },
});

const { addQueue, removeQueue, setQueues, replaceQueues, express } =
  createDashboard(taskRunnerQueueService, {
    route: TASK_RUNNER_DASHBOARD_ROUTE_PREFIX,
    port: TASK_RUNNER_DASHBOARD_PORT,
  });
