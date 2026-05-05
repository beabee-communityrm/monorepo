import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueEmailId1773823606137 implements MigrationInterface {
  name = 'UniqueEmailId1773823606137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Find all duplicate emailId rows (all except the most recent per emailId)
    const duplicates: {
      soeId: string;
      emailId: string;
      segmentId: string;
      trigger: string;
      keepSegmentId: string;
      keepTrigger: string;
    }[] = await queryRunner.query(
      `SELECT
         dup."id" AS "soeId",
         dup."emailId",
         dup."segmentId",
         dup."trigger",
         keep."segmentId" AS "keepSegmentId",
         keep."trigger" AS "keepTrigger"
       FROM "segment_ongoing_email" dup
       JOIN (
         SELECT DISTINCT ON ("emailId") "id", "emailId", "segmentId", "trigger"
         FROM "segment_ongoing_email"
         ORDER BY "emailId", "date" DESC
       ) keep ON keep."emailId" = dup."emailId" AND keep."id" != dup."id"`
    );

    for (const dup of duplicates) {
      const isDifferentConfig =
        dup.segmentId !== dup.keepSegmentId || dup.trigger !== dup.keepTrigger;

      if (isDifferentConfig) {
        // Different segment or trigger: clone the email so this config is preserved
        const [cloned] = await queryRunner.query(
          `INSERT INTO "email" ("name", "fromName", "fromEmail", "subject", "body", "templateId")
           SELECT "name", "fromName", "fromEmail", "subject", "body", NULL
           FROM "email" WHERE "id" = $1
           RETURNING "id"`,
          [dup.emailId]
        );
        await queryRunner.query(
          `UPDATE "segment_ongoing_email" SET "emailId" = $1 WHERE "id" = $2`,
          [cloned.id, dup.soeId]
        );
        queryRunner.connection.logger.log(
          'warn',
          `UniqueEmailId migration: cloned email ${dup.emailId} -> ${cloned.id} for segment_ongoing_email ${dup.soeId} (segment=${dup.segmentId}, trigger=${dup.trigger})`
        );
      } else {
        // True duplicate (same segment + trigger): safe to delete
        await queryRunner.query(
          `DELETE FROM "segment_ongoing_email" WHERE "id" = $1`,
          [dup.soeId]
        );
        queryRunner.connection.logger.log(
          'warn',
          `UniqueEmailId migration: deleted duplicate segment_ongoing_email ${dup.soeId} (emailId=${dup.emailId}, segment=${dup.segmentId}, trigger=${dup.trigger})`
        );
      }
    }

    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" DROP CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ADD CONSTRAINT "UQ_fef3c998a2489b528d8eba1e3ba" UNIQUE ("emailId")`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ADD CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba" FOREIGN KEY ("emailId") REFERENCES "email"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" DROP CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" DROP CONSTRAINT "UQ_fef3c998a2489b528d8eba1e3ba"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ADD CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba" FOREIGN KEY ("emailId") REFERENCES "email"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
