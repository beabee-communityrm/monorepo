import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewerCanEdit1752486366243 implements MigrationInterface {
  name = 'AddReviewerCanEdit1752486366243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_reviewer" ADD "canEdit" boolean`
    );
    await queryRunner.query(`UPDATE "callout_reviewer" SET "canEdit" = false`);
    await queryRunner.query(
      `ALTER TABLE "callout_reviewer" ALTER COLUMN "canEdit" SET NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_reviewer" DROP COLUMN "canEdit"`
    );
  }
}
