import {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository,
  SelectQueryBuilder
} from "typeorm";

import { log as mainLogger } from "#core/logging";

import { config } from "@beabee/config";

const log = mainLogger.child({ app: "database" });

// This is used by the TypeORM CLI to run migrations
const dataSource: DataSource = new DataSource({
  type: "postgres",
  url: config.databaseUrl,
  logging: config.dev,
  entities: [__dirname + "/../models/*.js"],
  migrations: [__dirname + "/../migrations/*.js"]
});

function runTransaction<T>(
  runInTransaction: (em: EntityManager) => Promise<T>
): Promise<T> {
  return dataSource.transaction(runInTransaction);
}

function getRepository<Entity extends ObjectLiteral>(
  target: EntityTarget<Entity>
): Repository<Entity> {
  return dataSource.getRepository(target);
}

function createQueryBuilder<Entity extends ObjectLiteral>(
  entityClass: EntityTarget<Entity>,
  alias: string,
  queryRunner?: QueryRunner
): SelectQueryBuilder<Entity>;
function createQueryBuilder(queryRunner?: QueryRunner): SelectQueryBuilder<any>;
function createQueryBuilder<Entity extends ObjectLiteral>(
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

async function connect(): Promise<void> {
  try {
    await dataSource.initialize();
    log.info("Connected to database");
  } catch (error) {
    log.error("Error connecting to database", error);
    process.exit(1);
  }
}

async function close(): Promise<void> {
  await dataSource.destroy();
}

export const database = {
  dataSource,
  connect,
  close,
  runTransaction,
  getRepository,
  createQueryBuilder
};