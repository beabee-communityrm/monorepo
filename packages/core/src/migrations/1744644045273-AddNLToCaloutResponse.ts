import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNLToCaloutResponse1744644045273 implements MigrationInterface {
  name = "AddNLToCaloutResponse1744644045273";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_response" ADD "newsletter" jsonb`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_response" DROP COLUMN "newsletter"`
    );
  }
}
