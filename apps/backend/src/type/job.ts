import type { JobArgsMap, JobLogLevel, JobName } from '@beabee/beabee-common';

import type { ClassConstructor } from 'class-transformer';

/** Writes to the backend log and to the response stream of the running job */
export type JobLogger = Record<JobLogLevel, (message: string) => void>;

export interface Job<N extends JobName> {
  /** DTO class the request's `args` are validated against */
  argsDto: ClassConstructor<JobArgsMap[N]>;
  run(args: JobArgsMap[N], log: JobLogger): Promise<void>;
}

export type JobRegistry = { [N in JobName]: Job<N> };
