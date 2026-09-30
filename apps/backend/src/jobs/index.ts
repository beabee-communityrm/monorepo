import { JobName } from '@beabee/beabee-common';

import type { JobRegistry } from '#type/job';

import { databaseCleanJob } from './database-clean.js';

export const jobs: JobRegistry = {
  [JobName.DatabaseClean]: databaseCleanJob,
};

export function isJobName(name: string): name is JobName {
  return Object.values<string>(JobName).includes(name);
}
