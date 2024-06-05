import { Queue } from 'bullmq';

const REDIS_SERVICE_HOST = process.env.REDIS_SERVICE_HOST || 'localhost';
const REDIS_SERVICE_PORT = process.env.REDIS_SERVICE_PORT || 6379;

export const foobarQueue = new Queue('foobar', {
    connection: {
        host: REDIS_SERVICE_HOST,
        port: Number(REDIS_SERVICE_PORT),
    },
});
