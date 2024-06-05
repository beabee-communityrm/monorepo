import { Queue } from "bullmq";

export type QueryInfo = {
  description: string;
  queue: Queue;
};
