import type { ActivityActorType, JobName } from '../data/index.js';
import type { JobArgsMap } from './job-args.js';

export interface RunJobData<N extends JobName> {
  args: JobArgsMap[N];
  /** Who triggered the job, recorded in the activity feed */
  actor: ActivityActorType.BackendCLI | ActivityActorType.Cron;
}
