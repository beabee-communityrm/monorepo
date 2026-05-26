import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateStripeOptions1771840338000 implements MigrationInterface {
  name = 'MigrateStripeOptions1771840338000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO "option" (key, value)
      VALUES ('stripe-webhook-secret', $1), ('stripe-membership-product-id', $2)
      ON CONFLICT (key) DO NOTHING
    `,
      [
        process.env.BEABEE_STRIPE_WEBHOOKSECRET || '',
        process.env.BEABEE_STRIPE_MEMBERSHIPPRODUCTID || '',
      ]
    );

    await queryRunner.query(
      `UPDATE "option" SET "key"= 'stripe-tax-rate-one-time-id' WHERE "key" = 'tax-rate-one-time-stripe-id'`
    );
    await queryRunner.query(
      `UPDATE "option" SET "key"= 'stripe-tax-rate-recurring-id' WHERE "key" = 'tax-rate-recurring-stripe-id'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "option" SET "key"= 'tax-rate-one-time-stripe-id' WHERE "key" = 'stripe-tax-rate-one-time-id'
    `);
    await queryRunner.query(`
      UPDATE "option" SET "key"= 'tax-rate-recurring-stripe-id' WHERE "key" = 'stripe-tax-rate-recurring-id'
    `);
    await queryRunner.query(`
      DELETE FROM "option" WHERE "key" IN ('stripe-webhook-secret', 'stripe-membership-product-id')
    `);
  }
}
