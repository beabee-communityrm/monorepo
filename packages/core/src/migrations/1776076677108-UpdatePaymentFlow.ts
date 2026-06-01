import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePaymentFlow1776076677108 implements MigrationInterface {
  name = 'UpdatePaymentFlow1776076677108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "paymentFlowId" TO "providerFlowId"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "method" character varying`
    );
    await queryRunner.query(
      `UPDATE "payment_flow" SET "method" = "params"->>'paymentMethod'`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "method" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "params" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "payment_flow" SET "params" = jsonb_set("params", '{paymentMethod}', to_jsonb("method"))`
    );
    await queryRunner.query(`ALTER TABLE "payment_flow" DROP COLUMN "method"`);
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "params" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "providerFlowId" TO "paymentFlowId"`
    );
  }
}
