import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalloutResponseEmail1760107926234
  implements MigrationInterface
{
  name = 'AddCalloutResponseEmail1760107926234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout" ADD "sendResponseEmail" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD "responseEmailSubject" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD "responseEmailBody" text`
    );

    // Clean up old email template overrides for confirm-callout-response
    // This template was replaced with callout-response-answers
    await queryRunner.query(`
      UPDATE "option"
      SET "value" = (
        SELECT COALESCE(
          jsonb_set(
            COALESCE("value"::jsonb, '{}'),
            '{confirm-callout-response}',
            'null'::jsonb
          ) - 'confirm-callout-response',
          '{}'::jsonb
        )::text
        FROM "option"
        WHERE "key" = 'email-templates'
      )
      WHERE "key" = 'email-templates'
      AND "value"::jsonb ? 'confirm-callout-response'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP COLUMN "responseEmailBody"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP COLUMN "responseEmailSubject"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout" DROP COLUMN "sendResponseEmail"`
    );
  }
}
