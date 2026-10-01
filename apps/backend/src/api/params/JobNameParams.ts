import { JobName } from '@beabee/beabee-common';

import { IsEnum } from 'class-validator';

export class JobNameParams {
  @IsEnum(JobName)
  name!: JobName;
}
