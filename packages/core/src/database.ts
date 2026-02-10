import 'reflect-metadata';

import {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import config from './config/config';
import { log as mainLogger } from './logging';

const log = mainLogger.child({ app: 'database' });

export const dataSource: DataSource = new DataSource({
  type: 'postgres',
  url: config.databaseUrl,
  logging: config.logging.includes('database'),
  entities: [__dirname + '/models/*.js'],
  migrations: [__dirname + '/migrations/*.js'],
});

export function runTransaction<T>(
  runInTransaction: (em: EntityManager) => Promise<T>
): Promise<T> {
  return dataSource.transaction(runInTransaction);
}

export function getRepository<Entity extends ObjectLiteral>(
  target: EntityTarget<Entity>
): Repository<Entity> {
  return dataSource.getRepository(target);
}

export function createQueryBuilder<Entity extends ObjectLiteral>(
  entityClass: EntityTarget<Entity>,
  alias: string,
  queryRunner?: QueryRunner
): SelectQueryBuilder<Entity>;
export function createQueryBuilder(
  queryRunner?: QueryRunner
): SelectQueryBuilder<any>;
export function createQueryBuilder<Entity extends ObjectLiteral>(
  arg1?: EntityTarget<Entity> | QueryRunner,
  alias?: string,
  queryRunner?: QueryRunner
): SelectQueryBuilder<Entity> {
  if (alias) {
    return dataSource.createQueryBuilder(
      arg1 as EntityTarget<Entity>,
      alias,
      queryRunner
    );
  } else {
    return dataSource.createQueryBuilder(arg1 as QueryRunner);
  }
}

export async function connect(): Promise<void> {
  try {
    await dataSource.initialize();
    log.info('Connected to database');
  } catch (error) {
    log.error('Error connecting to database', error);
    process.exit(1);
  }
}

export async function close(): Promise<void> {
  await dataSource.destroy();
}
