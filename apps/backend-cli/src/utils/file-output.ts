import { dataSource } from '@beabee/core/database';

/**
 * Run a function with TypeORM query logging temporarily disabled.
 */
export async function withTypeOrmQueryLoggingDisabled(
  fn: () => Promise<void>
): Promise<void> {
  const originalLogQuery = dataSource.logger.logQuery;
  dataSource.logger.logQuery = () => {};

  try {
    await fn();
  } finally {
    dataSource.logger.logQuery = originalLogQuery;
  }
}
