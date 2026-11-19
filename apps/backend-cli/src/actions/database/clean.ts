import { getRepository } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import {
  PaymentFlow,
  ResetSecurityFlow,
  SignupFlow,
} from '@beabee/core/models';
import { runApp } from '@beabee/core/server';

import { subDays } from 'date-fns/subDays';
import {
  EntityTarget,
  FindOptionsWhere,
  LessThan,
  ObjectLiteral,
} from 'typeorm';

const log = mainLogger.child({ app: 'database-clean' });

/**
 * Clean old data from a specific entity
 *
 * @param entity The entity to clean data from
 * @param findOptions The conditions to match records for deletion
 */
async function clean<T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  findOptions: FindOptionsWhere<T>
): Promise<void> {
  const repo = getRepository(entity);
  const { affected } = await repo.delete(findOptions);
  log.info(`Cleaned ${affected || 0} records from ${repo.metadata.name}`);
}

/**
 * Clean old data from the database
 */
export const cleanDatabase = async (): Promise<void> => {
  await runApp(async () => {
    log.info('🧹 Starting database cleanup...');

    const now = new Date();

    await clean(ResetSecurityFlow, { date: LessThan(subDays(now, 1)) });
    await clean(SignupFlow, { date: LessThan(subDays(now, 1)) });
    await clean(PaymentFlow, { date: LessThan(subDays(now, 7)) });

    log.info('✅ Database cleanup completed successfully!');
  });
};
