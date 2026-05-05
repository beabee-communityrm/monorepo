import fs from 'fs';
import { createRequire } from 'node:module';
import type { MigrationInterface, QueryRunner } from 'typeorm';

const require = createRequire(import.meta.url);

export class SessionTable1616677358190 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const sessionSqlPath = require.resolve('connect-pg-simple/table.sql');
    const sessionSql = fs.readFileSync(sessionSqlPath).toString();
    await queryRunner.query(sessionSql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE session');
  }
}
