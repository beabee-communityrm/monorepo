import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoicePaymentType1769451523913 implements MigrationInterface {
  name = 'AddInvoicePaymentType1769451523913';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "type" character varying`
    );

    await queryRunner.query(
      `UPDATE "payment" SET "type" = 'recurring' WHERE "subscriptionId" IS NOT NULL`
    );

    await queryRunner.query(
      `UPDATE "payment" SET "type" = 'one-time' WHERE "subscriptionId" IS NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "type" SET NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "type"`);
  }
}
