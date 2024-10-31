import { MigrationInterface, QueryRunner } from "typeorm";

export class ContactTag1730380142108 implements MigrationInterface {
  name = "ContactTag1730380142108";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create contact_tag table
    await queryRunner.query(`CREATE TABLE "contact_tag" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "description" character varying NOT NULL,
            CONSTRAINT "UQ_name_unique" UNIQUE ("name"),
            CONSTRAINT "PK_contact_tag" PRIMARY KEY ("id")
        )`);

    // Create junction table
    await queryRunner.query(`CREATE TABLE "contact_tag_assignments" (
            "contactId" uuid NOT NULL,
            "tagId" uuid NOT NULL,
            CONSTRAINT "PK_contact_tag_assignments" PRIMARY KEY ("contactId", "tagId")
        )`);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_contact_tag_contact" ON "contact_tag_assignments" ("contactId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contact_tag_tag" ON "contact_tag_assignments" ("tagId")`
    );

    // Add foreign key constraints
    await queryRunner.query(`ALTER TABLE "contact_tag_assignments"
            ADD CONSTRAINT "FK_contact_tag_contact"
            FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE`);

    await queryRunner.query(`ALTER TABLE "contact_tag_assignments"
            ADD CONSTRAINT "FK_contact_tag_tag"
            FOREIGN KEY ("tagId") REFERENCES "contact_tag"("id") ON DELETE CASCADE`);

    // Migrate existing unique tags
    await queryRunner.query(`
            WITH unique_tags AS (
                SELECT DISTINCT jsonb_array_elements_text(tags) as name
                FROM contact_profile
                WHERE tags != '[]'::jsonb
            )
            INSERT INTO contact_tag (name, description)
            SELECT name, '' as description
            FROM unique_tags;
        `);

    // Create tag assignments for existing contacts
    await queryRunner.query(`
            INSERT INTO contact_tag_assignments ("contactId", "tagId")
            SELECT cp."contactId", ct.id
            FROM contact_profile cp
            CROSS JOIN LATERAL jsonb_array_elements_text(cp.tags) as tag_name
            JOIN contact_tag ct ON ct.name = tag_name
            WHERE cp.tags != '[]'::jsonb;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Migrate tags back to contact_profile before dropping tables
    await queryRunner.query(`
            UPDATE contact_profile cp
            SET tags = (
                SELECT jsonb_agg(ct.name)
                FROM contact_tag_assignments cta
                JOIN contact_tag ct ON ct.id = cta."tagId"
                WHERE cta."contactId" = cp."contactId"
            )
            WHERE EXISTS (
                SELECT 1
                FROM contact_tag_assignments cta
                WHERE cta."contactId" = cp."contactId"
            );
        `);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" DROP CONSTRAINT "FK_contact_tag_tag"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" DROP CONSTRAINT "FK_contact_tag_contact"`
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_contact_tag_tag"`);
    await queryRunner.query(`DROP INDEX "IDX_contact_tag_contact"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "contact_tag_assignments"`);
    await queryRunner.query(`DROP TABLE "contact_tag"`);
  }
}
