import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePaymentFlow1772473765054 implements MigrationInterface {
  name = 'UpdatePaymentFlow1772473765054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create backup table
    await queryRunner.query(
      `CREATE TABLE "payment_flow_old" AS SELECT * FROM "payment_flow"`
    );

    // Add new columns as nullable first
    await queryRunner.query(`ALTER TABLE "payment_flow" ADD "params" jsonb`);
    await queryRunner.query(`ALTER TABLE "payment_flow" ADD "form" jsonb`);

    // Migrate existing data to new structure
    await queryRunner.query(`
      UPDATE "payment_flow"
      SET
        "params" = CASE
          WHEN "formPaymentmethod" = 'gocardless-direct-debit' THEN
            json_build_object(
              'paymentMethod', "formPaymentmethod",
              'completeUrl', ''
            )::jsonb
          ELSE
            json_build_object(
              'paymentMethod', "formPaymentmethod",
              'completeUrl', '',
              'firstname', COALESCE("formFirstname", ''),
              'lastname', COALESCE("formLastname", ''),
              'vatNumber', COALESCE("formVatnumber", '')
            )::jsonb
        END,
        "form" = CASE
          WHEN "formPeriod" = 'one-time' THEN
            json_build_object(
              'action', 'create-one-time-payment',
              'amount', "formMonthlyamount",
              'payFee', "formPayfee"
            )::jsonb
          WHEN "formMonthlyamount" = 0 THEN
            json_build_object(
              'action', 'update-payment-method'
            )::jsonb
          ELSE
            json_build_object(
              'action', 'start-contribution',
              'monthlyAmount', "formMonthlyamount",
              'period', "formPeriod",
              'payFee', "formPayfee"
            )::jsonb
        END
    `);

    // Make new columns non-nullable
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "params" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "form" SET NOT NULL`
    );

    // Drop old columns
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add old columns back
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
      `ALTER TABLE "payment_flow" ADD "formPaymentmethod" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formPeriod" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formMonthlyamount" real`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formProrate" boolean DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formPayfee" boolean`
    );

    // Migrate data back from JSON to individual columns
    await queryRunner.query(`
      UPDATE "payment_flow"
      SET
        "formPaymentmethod" = "params"->>'paymentMethod',
        "formFirstname" = CASE WHEN "params"->>'firstname' != '' THEN "params"->>'firstname' ELSE NULL END,
        "formLastname" = CASE WHEN "params"->>'lastname' != '' THEN "params"->>'lastname' ELSE NULL END,
        "formVatnumber" = CASE WHEN "params"->>'vatNumber' != '' THEN "params"->>'vatNumber' ELSE NULL END,
        "formPeriod" = CASE
          WHEN ("form"->>'action') = 'create-one-time-payment' THEN 'one-time'
          WHEN ("form"->>'action') = 'update-payment-method' THEN 'monthly'
          ELSE "form"->>'period'
        END,
        "formMonthlyamount" = CASE
          WHEN ("form"->>'action') = 'create-one-time-payment' THEN ("form"->>'amount')::real
          WHEN ("form"->>'action') = 'update-payment-method' THEN 0
          ELSE ("form"->>'monthlyAmount')::real
        END,
        "formPayfee" = CASE
          WHEN ("form"->>'action') = 'update-payment-method' THEN false
          ELSE ("form"->>'payFee')::boolean
        END,
        "formProrate" = false
    `);

    // Make required columns non-nullable
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "formPaymentmethod" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "formPeriod" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "formMonthlyamount" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "formProrate" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "formPayfee" SET NOT NULL`
    );

    // Drop new JSON columns
    await queryRunner.query(`ALTER TABLE "payment_flow" DROP COLUMN "form"`);
    await queryRunner.query(`ALTER TABLE "payment_flow" DROP COLUMN "params"`);

    // Clean up backup table
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_flow_old"`);
  }
}
