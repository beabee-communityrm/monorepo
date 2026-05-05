import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendMemberRoleExpiry1774540406786 implements MigrationInterface {
  name = 'ExtendMemberRoleExpiry1774540406786';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 7 days to dateExpires for active member roles only
    await queryRunner.query(`
      UPDATE "contact_role"
      SET "dateExpires" = "dateExpires" + INTERVAL '7 days'
      WHERE "type" = 'member' 
      AND "dateExpires" IS NOT NULL
      AND "dateExpires" > NOW()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Subtract 7 days from dateExpires for active member roles (revert the change)
    await queryRunner.query(`
      UPDATE "contact_role"
      SET "dateExpires" = "dateExpires" - INTERVAL '7 days'
      WHERE "type" = 'member' 
      AND "dateExpires" IS NOT NULL
      AND "dateExpires" > NOW()
    `);
  }
}
