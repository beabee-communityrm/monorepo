import { MigrationInterface, QueryRunner } from 'typeorm';

const renames = [
  ['contact.segments-added', 'contact-segment.added'],
  ['contact.segments-deleted', 'contact-segment.deleted'],
  ['contact.segments-updated', 'contact-segment.updated'],
  ['callout.segments-added', 'callout-response-segment.added'],
  ['callout.segments-deleted', 'callout-response-segment.deleted'],
  ['callout.segments-updated', 'callout-response-segment.updated'],
  ['email.sent', 'contact.email-sent'],
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [from, to] of renames) {
      await queryRunner.query(
        `UPDATE "activity_event" SET "eventType" = $1 WHERE "eventType" = $2`,
        [from, to]
      );
    }
  }
}
