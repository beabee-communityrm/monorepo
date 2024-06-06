import { createDashboard } from './dashboard';
import { TaskRunnerService } from '@beabee/task-runner/src';

const TASK_RUNNER_REDIS_HOST = process.env.TASK_RUNNER_REDIS_HOST || 'localhost';
const TASK_RUNNER_REDIS_PORT = Number(process.env.TASK_RUNNER_REDIS_PORT) || 6379;

const taskRunnerService = new TaskRunnerService({
    connection: {
        host: TASK_RUNNER_REDIS_HOST,
        port: TASK_RUNNER_REDIS_PORT,
    },
});

const { addQueue, removeQueue, setQueues, replaceQueues, express } = createDashboard(taskRunnerService);

