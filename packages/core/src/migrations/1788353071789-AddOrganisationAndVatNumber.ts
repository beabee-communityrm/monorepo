import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganisationAndVatNumber1788353071789 implements MigrationInterface {
  name = 'AddOrganisationAndVatNumber1788353071789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact_profile" ADD "organisation" text NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" ADD "vatNumber" character varying NOT NULL DEFAULT ''`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact_profile" DROP COLUMN "vatNumber"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" DROP COLUMN "organisation"`
    );
  }
}
