import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNLOptInRemovePwCallouts1743001845903
  implements MigrationInterface
{
  name = 'AddNLOptInRemovePwCallouts1743001845903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout" DROP COLUMN "responsePassword"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout" ADD "showNewsletterOptIn" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout" DROP COLUMN "showNewsletterOptIn"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout" ADD "responsePassword" character varying`
    );
  }
}
