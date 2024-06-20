import { TaskRunnerWorkerService } from '@beabee/task-runner/src';
import { StripeSubscriptionHandler } from './handler/stripe-subscription.handler';

const TASK_RUNNER_REDIS_HOST = process.env.TASK_RUNNER_REDIS_HOST || 'localhost';
const TASK_RUNNER_REDIS_PORT = Number(process.env.TASK_RUNNER_REDIS_PORT) || 6379;

const taskRunnerWorkerService = new TaskRunnerWorkerService({
    connection: {
        host: TASK_RUNNER_REDIS_HOST,
        port: TASK_RUNNER_REDIS_PORT,
    },
});

const stripeSubscriptionHandler = new StripeSubscriptionHandler(taskRunnerWorkerService);

