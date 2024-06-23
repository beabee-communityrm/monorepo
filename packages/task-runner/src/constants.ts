import type { QueueName } from "./types/index.ts";

export enum QUEUE {
  STRIPE_SUBSCRIPTION = "stripeSubscription",
}

/**
 * Known queues
 */
export const TASK_RUNNER_KNOWN_QUEUES = {
  [QUEUE.STRIPE_SUBSCRIPTION]: {
    description: "Queue to run Stripe subscription jobs",
  },
};

export const TASK_RUNNER_KNOWN_QUEUES_NAMES = Object.keys(
  TASK_RUNNER_KNOWN_QUEUES,
) as QueueName[];
