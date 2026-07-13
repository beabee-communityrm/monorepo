import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactIdpSubject1783608429797 implements MigrationInterface {
  name = 'AddContactIdpSubject1783608429797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact" ADD "idpSubject" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "contact" ADD CONSTRAINT "UQ_contact_idpSubject" UNIQUE ("idpSubject")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact" DROP CONSTRAINT "UQ_contact_idpSubject"`
    );
    await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "idpSubject"`);
  }
}
