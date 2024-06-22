import { TaskRunnerWorkerService } from '@beabee/task-runner/src';
import { database } from '@beabee/core';
import { StripeSubscriptionHandler } from './handler/stripe-subscription.handler';

import { config } from "@beabee/config";

// Init database connection
await database.connect();

const taskRunnerWorkerService = new TaskRunnerWorkerService({
    connection: {
        host: config.taskRunner.redis.host,
        port: config.taskRunner.redis.port,
    },
});

const stripeSubscriptionHandler = new StripeSubscriptionHandler(taskRunnerWorkerService);

