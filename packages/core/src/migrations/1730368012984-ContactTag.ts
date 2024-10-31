import { MigrationInterface, QueryRunner } from "typeorm";

export class ContactTag1730368012984 implements MigrationInterface {
  name = "ContactTag1730368012984";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the contact_tag table
    await queryRunner.query(
      `CREATE TABLE "contact_tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "ContactId" uuid NOT NULL, CONSTRAINT "PK_e46544545a47cff21d83da44cf1" PRIMARY KEY ("id"))`
    );

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "contact_tag" ADD CONSTRAINT "FK_a24206dba5d8ac4bce122435ba3" FOREIGN KEY ("ContactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    // Migrate existing tags from ContactProfile to ContactTag
    await queryRunner.query(`
      INSERT INTO contact_tag (name, description, "ContactId")
      SELECT DISTINCT
        jsonb_array_elements_text(cp.tags) as name,
        '' as description,
        cp."contactId"
      FROM contact_profile cp
      WHERE cp.tags != '[]'::jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Migrate tags back to ContactProfile before dropping the table
    await queryRunner.query(`
      UPDATE contact_profile cp
      SET tags = (
        SELECT jsonb_agg(ct.name)
        FROM contact_tag ct
        WHERE ct."ContactId" = cp."contactId"
      )
      WHERE EXISTS (
        SELECT 1
        FROM contact_tag ct
        WHERE ct."ContactId" = cp."contactId"
      );
    `);

    // Remove foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "contact_tag" DROP CONSTRAINT "FK_a24206dba5d8ac4bce122435ba3"`
    );

    // Drop the contact_tag table
    await queryRunner.query(`DROP TABLE "contact_tag"`);
  }
}
