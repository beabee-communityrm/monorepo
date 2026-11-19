import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactNewsletter1791213412132 implements MigrationInterface {
  name = 'AddContactNewsletter1791213412132';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contact_newsletter" ("contactId" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'none', "groups" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "REL_8819e6f08afc16debd560b973c" UNIQUE ("contactId"), CONSTRAINT "PK_8819e6f08afc16debd560b973c1" PRIMARY KEY ("contactId"))`
    );
    await queryRunner.query(
      `INSERT INTO "contact_newsletter" ("contactId", "status", "groups") SELECT "contactId", "newsletterStatus", "newsletterGroups" FROM "contact_profile"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_newsletter" ADD CONSTRAINT "FK_8819e6f08afc16debd560b973c1" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" DROP COLUMN "newsletterStatus"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" DROP COLUMN "newsletterGroups"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact_profile" ADD "newsletterGroups" jsonb NOT NULL DEFAULT '[]'`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" ADD "newsletterStatus" character varying NOT NULL DEFAULT 'none'`
    );
    await queryRunner.query(
      `UPDATE "contact_profile" p SET "newsletterStatus" = n."status", "newsletterGroups" = n."groups" FROM "contact_newsletter" n WHERE n."contactId" = p."contactId"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_newsletter" DROP CONSTRAINT "FK_8819e6f08afc16debd560b973c1"`
    );
    await queryRunner.query(`DROP TABLE "contact_newsletter"`);
  }
}
