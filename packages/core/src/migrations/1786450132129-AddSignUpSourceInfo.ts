import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSignUpSourceInfo1786450132129 implements MigrationInterface {
  name = 'AddSignUpSourceInfo1786450132129';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "signup_flow" ADD "origin" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "signup_flow" DROP COLUMN "origin"`);
  }
}
