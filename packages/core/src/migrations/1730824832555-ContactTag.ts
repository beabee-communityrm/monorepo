import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContactTag1730824832555 implements MigrationInterface {
  name = 'ContactTag1730824832555';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tables
    await queryRunner.query(
      `CREATE TABLE "contact_tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_4f430fb165d3f0dfdfe5121c7c7" UNIQUE ("name"), CONSTRAINT "PK_e46544545a47cff21d83da44cf1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "contact_tag_assignments" ("contactId" uuid NOT NULL, "tagId" uuid NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a7bf8f7a284afc5b8e0017a12ad" PRIMARY KEY ("contactId", "tagId"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a7bf8f7a284afc5b8e0017a12a" ON "contact_tag_assignments" ("contactId", "tagId") `
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" ADD CONSTRAINT "FK_a9fefa4713408da694e358de52a" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" ADD CONSTRAINT "FK_5ed4c1702688b750da5e71ba5ad" FOREIGN KEY ("tagId") REFERENCES "contact_tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );

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
    // Migrate tags back to contact_profile
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

    // Drop constraints and tables (existing code)
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" DROP CONSTRAINT "FK_5ed4c1702688b750da5e71ba5ad"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" DROP CONSTRAINT "FK_a9fefa4713408da694e358de52a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7bf8f7a284afc5b8e0017a12a"`
    );
    await queryRunner.query(`DROP TABLE "contact_tag_assignments"`);
    await queryRunner.query(`DROP TABLE "contact_tag"`);
  }
}
