import { ConnectionOptions, Queue } from "../deps.ts";
import { KNOWN_QUEUES } from "../constants.ts";
import type { QueryInfo } from "../types/query-info.ts";

export class TaskRunnerService {
  private readonly _queues: Record<string, Queue> = {};

  constructor(
    protected readonly options: { connection: ConnectionOptions },
  ) {
    console.log("Task runner service");
  }

  queryNames() {
    return Object.keys(KNOWN_QUEUES) as (keyof typeof KNOWN_QUEUES)[];
  }

  getQueueInfo(name: keyof typeof KNOWN_QUEUES): QueryInfo {
    return {
      ...KNOWN_QUEUES[name],
      queue: this.getQueue(name),
    };
  }

  getQueue(name: keyof typeof KNOWN_QUEUES) {
    if (!KNOWN_QUEUES[name]) {
      throw new Error(`Unknown queue: ${name}`);
    }
    if (!this._queues[name]) {
      this._queues[name] = new Queue(name, {
        connection: this.options.connection,
      });
    }
    return this._queues[name];
  }

  getQueryInfos(): QueryInfo[] {
    return this.queryNames().map(this.getQueueInfo.bind(this));
  }
}
