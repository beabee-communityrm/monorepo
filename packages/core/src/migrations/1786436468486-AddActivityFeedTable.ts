import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivityFeedTable1786436468486 implements MigrationInterface {
  name = 'AddActivityFeedTable1786436468486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activity_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "targetId" uuid, "actorType" character varying NOT NULL, "actorId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "eventType" character varying NOT NULL, "metadata" jsonb, CONSTRAINT "PK_c2c1e9fdda754a6bf7f664d7e04" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_961fd8db043d34dc1087e7be2d" ON "activity_event" ("targetId", "createdAt") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_961fd8db043d34dc1087e7be2d"`
    );
    await queryRunner.query(`DROP TABLE "activity_event"`);
  }
}
