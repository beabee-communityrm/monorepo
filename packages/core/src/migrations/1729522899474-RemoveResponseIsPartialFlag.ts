import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveResponseIsPartialFlag1729522899474
  implements MigrationInterface
{
  name = "RemoveResponseIsPartialFlag1729522899474";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "callout_response" WHERE "isPartial"`);
    await queryRunner.query(
      `ALTER TABLE "callout_response" DROP COLUMN "isPartial"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_response" ADD "isPartial" boolean NOT NULL`
    );
  }
}
