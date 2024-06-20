import Express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/dist/src/queueAdapters/bullMQ.js';
import { ExpressAdapter } from '@bull-board/express';

import { basicAuth } from './auth';

import type { TaskRunnerQueueService } from '@beabee/task-runner/src';

const TASK_RUNNER_DASHBOARD_PORT = process.env.TASK_RUNNER_DASHBOARD_PORT || 3004;
const TASK_RUNNER_BASE_PATH = process.env.TASK_RUNNER_ROUTE_PREFIX || '/';

export const createDashboard = (TaskRunnerQueueService: TaskRunnerQueueService) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(TASK_RUNNER_BASE_PATH);

    const queues = TaskRunnerQueueService.getInfos();

    const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
        queues: queues.map((queue) => new BullMQAdapter(queue.queue, { description: queue.description })),
        serverAdapter,
        options: {
            uiConfig: {
                boardTitle: "Task Runner",
            }
        }
    });

    const express = Express();

    express.use(TASK_RUNNER_BASE_PATH, basicAuth, serverAdapter.getRouter());

    express.listen(TASK_RUNNER_DASHBOARD_PORT, () => {
        console.log(`Running on ${TASK_RUNNER_DASHBOARD_PORT}...`);
        console.log(`For the UI, open http://localhost:${TASK_RUNNER_DASHBOARD_PORT}${TASK_RUNNER_BASE_PATH}`);
    });

    return {
        addQueue,
        removeQueue,
        setQueues,
        replaceQueues,
        express,
    }
}

