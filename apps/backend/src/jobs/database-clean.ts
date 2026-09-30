import { JobName } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import {
  PaymentFlow,
  ResetSecurityFlow,
  SignupFlow,
} from '@beabee/core/models';

import { subDays } from 'date-fns';
import {
  EntityTarget,
  FindOptionsWhere,
  LessThan,
  ObjectLiteral,
} from 'typeorm';

import { DatabaseCleanJobArgsDto } from '#api/dto/JobDto';
import type { Job, JobLogger } from '#type/job';

async function clean<T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  findOptions: FindOptionsWhere<T>,
  log: JobLogger
): Promise<void> {
  const repo = getRepository(entity);
  const { affected } = await repo.delete(findOptions);
  log.info(`Cleaned ${affected || 0} records from ${repo.metadata.name}`);
}

/** Removes reset, signup and payment flows that were never completed */
export const databaseCleanJob: Job<JobName.DatabaseClean> = {
  argsDto: DatabaseCleanJobArgsDto,
  async run(_args, log) {
    const now = new Date();
    await clean(ResetSecurityFlow, { date: LessThan(subDays(now, 1)) }, log);
    await clean(SignupFlow, { date: LessThan(subDays(now, 1)) }, log);
    await clean(PaymentFlow, { date: LessThan(subDays(now, 7)) }, log);
  },
};
