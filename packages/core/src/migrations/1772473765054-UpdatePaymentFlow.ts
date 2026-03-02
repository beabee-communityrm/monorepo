import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePaymentFlow1772473765054 implements MigrationInterface {
  name = 'UpdatePaymentFlow1772473765054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payment_flow_old" AS SELECT * FROM "payment_flow"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formPayfee"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formProrate"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formMonthlyamount"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formPeriod"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formPaymentmethod"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formFirstname"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formLastname"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formVatnumber"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "params" jsonb NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "form" jsonb NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment_flow" DROP COLUMN "form"`);
    await queryRunner.query(`ALTER TABLE "payment_flow" DROP COLUMN "params"`);
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formVatnumber" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formLastname" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formFirstname" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formPaymentmethod" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formPeriod" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formMonthlyamount" real NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formProrate" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formPayfee" boolean NOT NULL`
    );
  }
}
