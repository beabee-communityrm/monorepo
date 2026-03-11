import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJoinFlowProcessingFlag1772636569908
  implements MigrationInterface
{
  name = 'AddJoinFlowProcessingFlag1772636569908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "join_flow" ADD IF NOT EXISTS "processing" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "payment_flow" ADD IF NOT EXISTS "processing" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "signup_flow" ADD IF NOT EXISTS "processing" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "join_flow" DROP COLUMN IF EXISTS "processing"`
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "payment_flow" DROP COLUMN IF EXISTS "processing"`
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "signup_flow" DROP COLUMN IF EXISTS "processing"`
    );
  }
}
