import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds templateId column to email table and migrates data from email-templates option.
 *
 * This migration:
 * 1. Adds a nullable unique templateId column to the email table
 * 2. Reads existing email-templates JSON from the option table
 * 3. Duplicates emails that are assigned to multiple templates
 * 4. Sets templateId on each override email
 * 5. Removes the email-templates option
 */
export class AddEmailTemplateId1764325270075 implements MigrationInterface {
  name = 'AddEmailTemplateId1764325270075';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Schema change: Add templateId column
    await queryRunner.query(
      `ALTER TABLE "email" ADD "templateId" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "email" ADD CONSTRAINT "UQ_77acaef2b18755ae18dd726b563" UNIQUE ("templateId")`
    );

    // 2. Data migration: Read existing email-templates option
    const result = await queryRunner.query(
      `SELECT "value" FROM "option" WHERE "key" = 'email-templates'`
    );

    if (result.length > 0 && result[0].value) {
      let emailTemplates: Record<string, string> = {};
      try {
        emailTemplates = JSON.parse(result[0].value);
      } catch {
        console.warn(
          'Failed to parse email-templates option, skipping data migration'
        );
        return;
      }

      // 3. Group templates by emailId to find duplicates
      const emailToTemplates: Record<string, string[]> = {};
      for (const [templateId, emailId] of Object.entries(emailTemplates)) {
        if (!emailId) continue;
        if (!emailToTemplates[emailId]) {
          emailToTemplates[emailId] = [];
        }
        emailToTemplates[emailId].push(templateId);
      }

      // 4. Process each email
      for (const [emailId, templateIds] of Object.entries(emailToTemplates)) {
        if (templateIds.length === 0) continue;

        // Check if email exists
        const emailExists = await queryRunner.query(
          `SELECT id FROM "email" WHERE id = $1`,
          [emailId]
        );

        if (emailExists.length === 0) {
          console.warn(`Email ${emailId} not found, skipping`);
          continue;
        }

        // First template: update existing email
        const firstTemplateId = templateIds[0];
        await queryRunner.query(
          `UPDATE "email" SET "templateId" = $1 WHERE id = $2`,
          [firstTemplateId, emailId]
        );

        // Additional templates: duplicate the email
        for (let i = 1; i < templateIds.length; i++) {
          const templateId = templateIds[i];
          await queryRunner.query(
            `INSERT INTO "email" (name, "fromName", "fromEmail", subject, body, "templateId")
             SELECT 
               name || ' (' || $1 || ')',
               "fromName",
               "fromEmail",
               subject,
               body,
               $1
             FROM "email" WHERE id = $2`,
            [templateId, emailId]
          );
        }
      }
    }

    // 5. Remove email-templates option (no longer needed)
    await queryRunner.query(
      `DELETE FROM "option" WHERE "key" = 'email-templates'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Recreate email-templates option from templateId column
    const emails = await queryRunner.query(
      `SELECT id, "templateId" FROM "email" WHERE "templateId" IS NOT NULL`
    );

    const emailTemplates: Record<string, string> = {};
    for (const email of emails) {
      emailTemplates[email.templateId] = email.id;
    }

    await queryRunner.query(
      `INSERT INTO "option" ("key", "value") VALUES ('email-templates', $1)`,
      [JSON.stringify(emailTemplates)]
    );

    // 2. Schema revert: Remove templateId column
    await queryRunner.query(
      `ALTER TABLE "email" DROP CONSTRAINT "UQ_77acaef2b18755ae18dd726b563"`
    );
    await queryRunner.query(`ALTER TABLE "email" DROP COLUMN "templateId"`);
  }
}
