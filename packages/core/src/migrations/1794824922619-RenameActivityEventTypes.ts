import { MigrationInterface, QueryRunner } from 'typeorm';

const renames = [
  ['contact.segments-added', 'contact-segment.added'],
  ['contact.segments-deleted', 'contact-segment.deleted'],
  ['contact.segments-updated', 'contact-segment.updated'],
  ['callout.segments-added', 'callout-response-segment.added'],
  ['callout.segments-deleted', 'callout-response-segment.deleted'],
  ['callout.segments-updated', 'callout-response-segment.updated'],
];

export class RenameActivityEventTypes1794824922619 implements MigrationInterface {
  name = 'RenameActivityEventTypes1794824922619';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [from, to] of renames) {
      await queryRunner.query(
        `UPDATE "activity_event" SET "eventType" = $1 WHERE "eventType" = $2`,
        [to, from]
      );
    }

    // An email sent to a contact targets that contact, any other email has no
    // target and stays as email.sent
    await queryRunner.query(
      `UPDATE "activity_event" SET "eventType" = 'contact.email-sent' WHERE "eventType" = 'email.sent' AND "targetId" IS NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [from, to] of renames) {
      await queryRunner.query(
        `UPDATE "activity_event" SET "eventType" = $1 WHERE "eventType" = $2`,
        [from, to]
      );
    }

    await queryRunner.query(
      `UPDATE "activity_event" SET "eventType" = 'email.sent' WHERE "eventType" = 'contact.email-sent'`
    );
  }
}
