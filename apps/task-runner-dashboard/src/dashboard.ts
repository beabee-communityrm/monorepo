import Express from 'express';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/dist/src/queueAdapters/bullMQ.js';
import { ExpressAdapter } from '@bull-board/express';

import { basicAuth } from './auth';

const TASK_RUNNER_DASHBOARD_PORT = process.env.TASK_RUNNER_DASHBOARD_PORT || 3004;

export const createDashboard = (queues: Queue[]) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
        queues: queues.map((queue) => new BullMQAdapter(queue)),
        serverAdapter: serverAdapter,
    });

    const express = Express();

    express.use('/admin/queues', basicAuth, serverAdapter.getRouter());

    express.listen(TASK_RUNNER_DASHBOARD_PORT, () => {
        console.log(`Running on ${TASK_RUNNER_DASHBOARD_PORT}...`);
        console.log(`For the UI, open http://localhost:${TASK_RUNNER_DASHBOARD_PORT}/admin/queues`);
        console.log('Make sure Redis is running on port 6379 by default');
    });

    return {
        addQueue,
        removeQueue,
        setQueues,
        replaceQueues,
        express,
    }
}

