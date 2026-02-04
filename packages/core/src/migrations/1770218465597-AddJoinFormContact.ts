import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJoinFormContact1770218465597 implements MigrationInterface {
  name = 'AddJoinFormContact1770218465597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "join_flow" ADD "contactId" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "join_flow" DROP COLUMN "contactId"`);
  }
}
