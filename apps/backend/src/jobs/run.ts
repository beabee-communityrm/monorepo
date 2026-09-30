import {
  ActivityActor,
  JobArgsMap,
  JobName,
  JobStreamLine,
} from '@beabee/beabee-common';
import { actorContext } from '@beabee/core/lib/actor-context';
import { log as mainLogger } from '@beabee/core/logging';

import { HttpError } from 'routing-controllers';

import type { Job, JobLogger } from '#type/job';

const running = new Set<JobName>();

/**
 * Reserve a job before streaming starts, so an overlapping run is refused
 * with a proper status code instead of mid-stream
 * @returns A function that releases the job again
 */
export function lockJob(name: JobName): () => void {
  if (running.has(name)) {
    throw new HttpError(409, `Job ${name} is already running`);
  }
  running.add(name);
  return () => running.delete(name);
}

/**
 * Run a job, sending every log line and the final status to `send`. Log lines
 * also go to the backend log, so the stream is only a second copy.
 */
export async function runJob<N extends JobName>(
  name: N,
  job: Job<N>,
  args: JobArgsMap[N],
  actor: ActivityActor,
  send: (line: JobStreamLine) => void
): Promise<void> {
  const log = mainLogger.child({ app: `job:${name}` });
  const jobLogger: JobLogger = {
    info: (message) => {
      log.info(message);
      send({ type: 'log', level: 'info', message });
    },
    warning: (message) => {
      log.warning(message);
      send({ type: 'log', level: 'warning', message });
    },
    error: (message) => {
      log.error(message);
      send({ type: 'log', level: 'error', message });
    },
  };

  try {
    await actorContext.run(actor, () => job.run(args, jobLogger));
    send({ type: 'result', status: 'ok' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Job failed: ${message}`, { error: err });
    send({ type: 'result', status: 'error', message });
  }
}
