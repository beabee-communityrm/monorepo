import { Queue } from 'bullmq';

const TASK_RUNNER_REDIS_HOST = process.env.TASK_RUNNER_REDIS_HOST || 'localhost';
const TASK_RUNNER_REDIS_PORT = process.env.TASK_RUNNER_REDIS_PORT || 6379;

export const foobarQueue = new Queue('foobar', {
    connection: {
        host: TASK_RUNNER_REDIS_HOST,
        port: Number(TASK_RUNNER_REDIS_PORT),
    },
});
