import Express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/dist/src/queueAdapters/bullMQ.js";
import { ExpressAdapter } from "@bull-board/express";

import { basicAuth } from "./auth";

import type { TaskRunnerQueueService } from "@beabee/task-runner/src";

export const createDashboard = (
  taskRunnerQueueService: TaskRunnerQueueService,
  options: { route: string; port: number },
) => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(options.route);

  const queues = taskRunnerQueueService.getInfos();

  const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: queues.map((queue) =>
      new BullMQAdapter(queue.queue, { description: queue.description })
    ),
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: "Task Runner",
      },
    },
  });

  const express = Express();

  express.use(options.route, basicAuth, serverAdapter.getRouter());

  express.listen(options.port, () => {
    console.log(`Running on ${options.port}...`);
    console.log(
      `For the UI, open http://localhost:${options.port}${options.route}`,
    );
  });

  return {
    addQueue,
    removeQueue,
    setQueues,
    replaceQueues,
    express,
  };
};
