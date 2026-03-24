import { getRepository } from '@beabee/core/database';
import { PaymentFlow, ResetSecurityFlow } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';

import { subDays } from 'date-fns';
import {
  EntityTarget,
  FindOptionsWhere,
  LessThan,
  ObjectLiteral,
} from 'typeorm';

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
  console.log(`Cleaned ${affected || 0} records from ${repo.metadata.name}`);
}

/**
 * Clean old data from the database
 */
export const cleanDatabase = async (): Promise<void> => {
  await runApp(async () => {
    console.log('🧹 Starting database cleanup...\n');

    const now = new Date();

    await clean(ResetSecurityFlow, { date: LessThan(subDays(now, 1)) });
    await clean(PaymentFlow, { date: LessThan(subDays(now, 7)) });

    console.log('\n✅ Database cleanup completed successfully!');
  });
};
