import type {
  JobLogLine,
  JobName,
  JobResultLine,
  JobStreamLine,
  RunJobData,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import {
  ApiError,
  JobFailedError,
  cleanUrl,
  isApiErrorResponse,
} from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for running Jobs. Uses fetch directly because the job endpoint
 * streams NDJSON and the shared Fetch wrapper waits for the whole body.
 */
export class JobClient extends BaseClient {
  constructor(options: BaseClientOptions) {
    super(options);
  }

  /**
   * Runs a job and resolves once it has finished
   * @param name - The job to run
   * @param data - The job's arguments and the actor to record
   * @param onLog - Called for every log line while the job runs
   * @throws {JobFailedError} When the job reports an error
   */
  async run<N extends JobName>(
    name: N,
    data: RunJobData<N>,
    onLog?: (line: JobLogLine) => void
  ): Promise<void> {
    const response = await globalThis.fetch(
      new URL(cleanUrl(`${this.options.path}/jobs/${name}`), this.options.host),
      {
        method: 'POST',
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json',
          ...(this.options.token && {
            Authorization: `Bearer ${this.options.token}`,
          }),
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok || !response.body) {
      throw await toError(response);
    }

    let result: JobResultLine | undefined;
    const handle = (raw: string) => {
      if (!raw.trim()) return;
      const line: JobStreamLine = JSON.parse(raw);
      if (line.type === 'log') {
        onLog?.(line);
      } else if (line.type === 'result') {
        result = line;
      }
    };

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      lines.forEach(handle);
    }
    handle(buffer + decoder.decode());

    if (!result) {
      throw new JobFailedError(name, 'The job ended without a result');
    }
    if (result.status === 'error') {
      throw new JobFailedError(name, result.message);
    }
  }
}

async function toError(response: globalThis.Response): Promise<unknown> {
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Not JSON, keep the raw text
  }
  return isApiErrorResponse(body) ? ApiError.fromData(body) : body || response;
}
