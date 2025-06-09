import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentContent1749237082653 implements MigrationInterface {
  name = "AddPaymentContent1749237082653";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "content" ("id", "data") VALUES ('payment', '{}')`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "content" WHERE "id"='payment'`);
  }
}
