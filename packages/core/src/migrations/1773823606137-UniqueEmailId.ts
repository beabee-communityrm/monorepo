import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueEmailId1773823606137 implements MigrationInterface {
  name = 'UniqueEmailId1773823606137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove duplicate emailId rows, keeping only the most recently created one
    await queryRunner.query(
      `DELETE FROM "segment_ongoing_email"
       WHERE "id" NOT IN (
         SELECT DISTINCT ON ("emailId") "id"
         FROM "segment_ongoing_email"
         ORDER BY "emailId", "date" DESC
       )`
    );
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
