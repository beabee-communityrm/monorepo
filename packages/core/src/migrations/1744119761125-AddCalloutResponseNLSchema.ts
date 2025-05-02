import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCalloutResponseNLSchema1744119761125
  implements MigrationInterface
{
  name = "AddCalloutResponseNLSchema1744119761125";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout" DROP COLUMN "showNewsletterOptIn"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout" ADD "newsletterSchema" jsonb`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout" DROP COLUMN "newsletterSchema"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout" ADD "showNewsletterOptIn" boolean NOT NULL DEFAULT false`
    );
  }
}
