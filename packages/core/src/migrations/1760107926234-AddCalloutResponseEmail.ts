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
