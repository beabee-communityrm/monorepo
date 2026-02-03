import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateTaxOptions1769782234884 implements MigrationInterface {
  name = 'MigrateTaxOptions1769782234884';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Move tax-rate-percentage to the content table
    await queryRunner.query(
      `UPDATE "content" SET data = jsonb_set(
        data, '{taxRateRecurring}',
        COALESCE(
          (SELECT "value" FROM "option" WHERE key = 'tax-rate-percentage'),
          'null'
        )::jsonb
      ) WHERE id = 'payment'`
    );

    // Remove unused options
    await queryRunner.query(
      `DELETE FROM "option" WHERE key IN ('tax-rate-enabled', 'tax-rate-percentage')`
    );

    // Rename to new key
    await queryRunner.query(
      `UPDATE "option" SET key = 'tax-rate-recurring-stripe-id' WHERE key = 'tax-rate-stripe-id'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert key rename
    await queryRunner.query(
      `UPDATE "option" SET key = 'tax-rate-stripe-id' WHERE key = 'tax-rate-recurring-stripe-id'`
    );

    // Move taxRateRecurring back to option
    await queryRunner.query(
      `INSERT INTO "option" (key, value)
      SELECT 'tax-rate-percentage', data->>'taxRateRecurring'
      FROM "content" WHERE id = 'payment'`
    );
    await queryRunner.query(
      `UPDATE "content" SET data = data - 'taxRateRecurring' WHERE id = 'payment'`
    );

    // Re-add unused option with default value
    await queryRunner.query(
      `INSERT INTO "option" (key, value) VALUES ('tax-rate-enabled', 'false')`
    );
  }
}
