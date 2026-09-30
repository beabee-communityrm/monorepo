import { ActivityActorType } from '@beabee/beabee-common';

import { IsIn, IsObject } from 'class-validator';

export class RunJobDto {
  /** Validated against the job's own args DTO once the job is known */
  @IsObject()
  args!: object;

  /** Who triggered the job, recorded in the activity feed */
  @IsIn([ActivityActorType.BackendCLI, ActivityActorType.Cron])
  actor!: ActivityActorType.BackendCLI | ActivityActorType.Cron;
}

export class DatabaseCleanJobArgsDto {}
