import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSignupFlowConfirmedAt1794578934541 implements MigrationInterface {
  name = 'AddSignupFlowConfirmedAt1794578934541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ADD "confirmedAt" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signup_flow" DROP COLUMN "confirmedAt"`
    );
  }
}
