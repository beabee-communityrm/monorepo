import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSignupFlowName1795015781454 implements MigrationInterface {
  name = 'AddSignupFlowName1795015781454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ADD "firstname" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ADD "lastname" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "signup_flow" DROP COLUMN "lastname"`);
    await queryRunner.query(
      `ALTER TABLE "signup_flow" DROP COLUMN "firstname"`
    );
  }
}
