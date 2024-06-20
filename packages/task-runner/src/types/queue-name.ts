import type { TASK_RUNNER_KNOWN_QUEUES } from "../constants.ts";

export type QueueName = keyof typeof TASK_RUNNER_KNOWN_QUEUES;
