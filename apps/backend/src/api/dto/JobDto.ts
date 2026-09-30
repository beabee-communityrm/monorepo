import { ActivityActorType } from '@beabee/beabee-common';

import { IsIn, IsObject, IsOptional } from 'class-validator';

export class RunJobDto {
  /** Validated against the job's own args DTO once the job is known */
  @IsObject()
  args!: object;

  @IsOptional()
  @IsIn([ActivityActorType.BackendCLI, ActivityActorType.Cron])
  actor?: ActivityActorType.BackendCLI | ActivityActorType.Cron;
}

export class DatabaseCleanJobArgsDto {}
