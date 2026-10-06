import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalloutResponseMode1789404005434 implements MigrationInterface {
  name = 'AddCalloutResponseMode1789404005434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout" ADD "responseMode" character varying NOT NULL DEFAULT 'single'`
    );

    // Copy data from allowMultiple/allowUpdate to responseMode
    await queryRunner.query(`
      UPDATE "callout" SET "responseMode" = CASE
        WHEN "allowMultiple" THEN 'multiple'
        WHEN "allowUpdate" THEN 'single-editable'
        ELSE 'single'
      END
    `);

    await queryRunner.query(
      `ALTER TABLE "callout" DROP COLUMN "allowMultiple"`
    );
    await queryRunner.query(`ALTER TABLE "callout" DROP COLUMN "allowUpdate"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout" ADD "allowUpdate" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "callout" ADD "allowMultiple" boolean NOT NULL DEFAULT false`
    );

    await queryRunner.query(`
      UPDATE "callout" SET
        "allowUpdate" = "responseMode" = 'single-editable',
        "allowMultiple" = "responseMode" = 'multiple'
    `);

    // allowUpdate had no default before responseMode replaced it
    await queryRunner.query(
      `ALTER TABLE "callout" ALTER COLUMN "allowUpdate" DROP DEFAULT`
    );
    await queryRunner.query(`ALTER TABLE "callout" DROP COLUMN "responseMode"`);
  }
}
