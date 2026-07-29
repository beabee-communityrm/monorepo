import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivityFeedTable1785332777650 implements MigrationInterface {
  name = 'AddActivityFeedTable1785332777650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activity_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contactId" uuid, "actorType" character varying NOT NULL, "actorId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "eventType" character varying NOT NULL, "metadata" jsonb, CONSTRAINT "PK_c2c1e9fdda754a6bf7f664d7e04" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e62175fabed7bc777681b5b9dd" ON "activity_event" ("contactId", "createdAt") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e62175fabed7bc777681b5b9dd"`
    );
    await queryRunner.query(`DROP TABLE "activity_event"`);
  }
}
