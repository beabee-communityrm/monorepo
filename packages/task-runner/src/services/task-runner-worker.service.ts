// deno-lint-ignore-file no-explicit-any
import { ConnectionOptions, Processor, Worker } from "../deps.ts";
import { TASK_RUNNER_KNOWN_QUEUES } from "../constants.ts";
import type { QueueName } from "../types/index.ts";

export class TaskRunnerWorkerService {
  private readonly _workers: Record<string, Worker<any, any, any>> = {};

  constructor(
    protected readonly options: { connection: ConnectionOptions },
  ) {
    console.log("New task runner worker service");
  }

  /**
   * Create a worker.
   * If the worker is not existent, a new worker is created
   */
  create<DataType = any, ResultType = any, NameType extends string = string>(
    name: QueueName,
    processor: Processor<DataType, ResultType, NameType>,
  ): Worker<DataType, ResultType, NameType> {
    if (!TASK_RUNNER_KNOWN_QUEUES[name]) {
      throw new Error(`Unknown worker: ${name}`);
    }
    if (this._workers[name]) {
      throw new Error(`Worker already exists: ${name}`);
    }

    this._workers[name] = new Worker<DataType, ResultType, NameType>(
      name,
      processor,
      {
        connection: this.options.connection,
      },
    );
    return this._workers[name];
  }
}
