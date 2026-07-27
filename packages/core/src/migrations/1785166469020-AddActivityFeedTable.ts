import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivityFeedTable1785166469020 implements MigrationInterface {
  name = 'AddActivityFeedTable1785166469020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_event" ALTER COLUMN "metadata" DROP NOT NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e62175fabed7bc777681b5b9dd" ON "activity_event" ("contactId", "createdAt") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e62175fabed7bc777681b5b9dd"`
    );
    await queryRunner.query(
      `ALTER TABLE "activity_event" ALTER COLUMN "metadata" SET NOT NULL`
    );
  }
}
