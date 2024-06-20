// deno-lint-ignore-file no-explicit-any
import { ConnectionOptions, Queue } from "../deps.ts";
import {
  TASK_RUNNER_KNOWN_QUEUES,
  TASK_RUNNER_KNOWN_QUEUES_NAMES,
} from "../constants.ts";
import type { QueryInfo, QueueName } from "../types/index.ts";

export class TaskRunnerQueueService {
  private readonly _queues: Record<string, Queue> = {};

  constructor(
    protected readonly options: { connection: ConnectionOptions },
  ) {
    console.log("Task runner queue service");
  }

  /**
   * Get the names of the known queues
   */
  getNames(): QueueName[] {
    return TASK_RUNNER_KNOWN_QUEUES_NAMES;
  }

  /**
   * Get the info of all known queues
   */
  getInfos(): QueryInfo[] {
    return this.getNames().map(this.getInfo.bind(this));
  }

  /**
   * Get the info of a known queue
   */
  getInfo(name: QueueName): QueryInfo {
    return {
      ...TASK_RUNNER_KNOWN_QUEUES[name],
      queue: this.get(name),
    };
  }

  /**
   * Get a queue.
   * If the queue is not existent, a new queue is created
   */
  get<DataType = any, ResultType = any, NameType extends string = string>(
    name: QueueName,
  ): Queue<DataType, ResultType, NameType> {
    if (!TASK_RUNNER_KNOWN_QUEUES[name]) {
      throw new Error(`Unknown queue: ${name}`);
    }
    if (!this._queues[name]) {
      return this.create<DataType, ResultType, NameType>(name);
    }
    return this._queues[name] as Queue<DataType, ResultType, NameType>;
  }

  create<DataType = any, ResultType = any, NameType extends string = string>(
    name: QueueName,
  ) {
    if (this._queues[name]) {
      throw new Error(`Queue already exists: ${name}`);
    }
    this._queues[name] = new Queue<DataType, ResultType, NameType>(name, {
      connection: this.options.connection,
    });
    return this._queues[name] as Queue<DataType, ResultType, NameType>;
  }
}
