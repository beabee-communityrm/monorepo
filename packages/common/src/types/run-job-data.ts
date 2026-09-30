import type { ActivityActorType, JobName } from '../data/index.js';
import type { JobArgsMap } from './job-args.js';

export interface RunJobData<N extends JobName> {
  args: JobArgsMap[N];
  /** Who triggered the job in the activity feed, defaults to the backend CLI */
  actor?: ActivityActorType.BackendCLI | ActivityActorType.Cron;
}
