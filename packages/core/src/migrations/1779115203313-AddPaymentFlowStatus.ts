import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentFlowStatus1779115203313 implements MigrationInterface {
  name = 'AddPaymentFlowStatus1779115203313';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "status" character varying NOT NULL DEFAULT 'new'`
    );
    await queryRunner.query(
      `UPDATE "payment_flow" SET "status" = 'processing' WHERE "processing" = true`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "processing"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "processing" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `UPDATE "payment_flow" SET "processing" = true WHERE "status" = 'processing'`
    );
    await queryRunner.query(`ALTER TABLE "payment_flow" DROP COLUMN "status"`);
  }
}
