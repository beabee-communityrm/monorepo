import { MigrationInterface, QueryRunner } from "typeorm";

export class ContactTag1730368012984 implements MigrationInterface {
  name = "ContactTag1730368012984";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contact_tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "ContactId" character varying NOT NULL, "contactId" uuid, CONSTRAINT "PK_e46544545a47cff21d83da44cf1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag" ADD CONSTRAINT "FK_a24206dba5d8ac4bce122435ba3" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact_tag" DROP CONSTRAINT "FK_a24206dba5d8ac4bce122435ba3"`
    );
    await queryRunner.query(`DROP TABLE "contact_tag"`);
  }
}
